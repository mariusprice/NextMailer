import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
  SendEmailCommandOutput,
} from '@aws-sdk/client-ses'
import { createServerClient } from '@/lib/supabase/server'
import { AnalyticsEventType } from '@/types/supabase'

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export interface EmailData {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
  fromEmail: string
  fromName?: string
}

export interface SendEmailResult {
  messageId: string | undefined
  success: boolean
  error?: string
}

/**
 * Send an email using AWS SES
 */
export async function sendEmail(emailData: EmailData): Promise<SendEmailResult> {
  try {
    const params: SendEmailCommandInput = {
      Source: emailData.fromName 
        ? `${emailData.fromName} <${emailData.fromEmail}>`
        : emailData.fromEmail,
      Destination: {
        ToAddresses: [emailData.to],
      },
      Message: {
        Subject: {
          Data: emailData.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: emailData.htmlBody,
            Charset: 'UTF-8',
          },
          Text: emailData.textBody ? {
            Data: emailData.textBody,
            Charset: 'UTF-8',
          } : undefined,
        },
      },
    }

    const command = new SendEmailCommand(params)
    const result: SendEmailCommandOutput = await sesClient.send(command)

    return {
      messageId: result.MessageId,
      success: true,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      messageId: undefined,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send emails to multiple recipients with rate limiting
 */
export async function sendBulkEmails(
  emails: EmailData[],
  campaignId: string,
  onProgress?: (sent: number, total: number) => void
): Promise<{ successful: number; failed: number }> {
  const supabase = createServerClient()
  let successful = 0
  let failed = 0
  
  // Rate limiting: SES has a default rate of 14 emails per second
  const EMAILS_PER_SECOND = 12 // Slightly under the limit
  const DELAY_MS = 1000 / EMAILS_PER_SECOND

  for (let i = 0; i < emails.length; i++) {
    const emailData = emails[i]
    
    try {
      const result = await sendEmail(emailData)
      
      if (result.success) {
        successful++
        
        // Log successful send to analytics
        await logEmailEvent(campaignId, emailData.to, 'sent', {
          messageId: result.messageId,
          timestamp: new Date().toISOString(),
        })
      } else {
        failed++
        
        // Log failed send to analytics
        await logEmailEvent(campaignId, emailData.to, 'bounced', {
          error: result.error,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      failed++
      console.error(`Failed to send email to ${emailData.to}:`, error)
      
      // Log error to analytics
      await logEmailEvent(campaignId, emailData.to, 'bounced', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    }
    
    // Update progress
    if (onProgress) {
      onProgress(successful + failed, emails.length)
    }
    
    // Rate limiting delay
    if (i < emails.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
  }

  return { successful, failed }
}

/**
 * Log email events to campaign analytics
 */
export async function logEmailEvent(
  campaignId: string,
  email: string,
  eventType: AnalyticsEventType,
  eventData: Record<string, any>
): Promise<void> {
  try {
    const supabase = createServerClient()
    
    // First, find the subscriber by email and campaign's email list
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('email_list_id')
      .eq('id', campaignId)
      .single()
    
    if (!campaign) {
      console.error('Campaign not found:', campaignId)
      return
    }
    
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', email)
      .eq('email_list_id', campaign.email_list_id)
      .single()
    
    if (!subscriber) {
      console.error('Subscriber not found:', email)
      return
    }
    
    // Insert the analytics event
    const { error } = await supabase
      .from('campaign_analytics')
      .insert({
        campaign_id: campaignId,
        subscriber_id: subscriber.id,
        event_type: eventType,
        event_data: eventData,
      })
    
    if (error) {
      console.error('Error logging email event:', error)
    }
  } catch (error) {
    console.error('Error logging email event:', error)
  }
}

/**
 * Handle SES bounce notifications (for webhook integration)
 */
export async function handleBounceNotification(
  bounceData: any
): Promise<void> {
  try {
    const supabase = createServerClient()
    
    if (bounceData.eventType === 'bounce' || bounceData.eventType === 'complaint') {
      const { mail, bounce, complaint } = bounceData
      const messageId = mail.messageId
      
      // Find the campaign analytics record by message ID
      const { data: analytics } = await supabase
        .from('campaign_analytics')
        .select('*')
        .eq('event_data->messageId', messageId)
        .eq('event_type', 'sent')
        .single()
      
      if (analytics) {
        // Log the bounce/complaint event
        await supabase
          .from('campaign_analytics')
          .insert({
            campaign_id: analytics.campaign_id,
            subscriber_id: analytics.subscriber_id,
            event_type: bounceData.eventType === 'bounce' ? 'bounced' : 'complaint',
            event_data: {
              bounceType: bounce?.bounceType,
              bounceSubType: bounce?.bounceSubType,
              complaintType: complaint?.complaintFeedbackType,
              timestamp: new Date().toISOString(),
              originalMessageId: messageId,
            },
          })
        
        // If it's a hard bounce, mark subscriber as bounced
        if (bounce?.bounceType === 'Permanent') {
          await supabase
            .from('subscribers')
            .update({ status: 'bounced' })
            .eq('id', analytics.subscriber_id)
        }
      }
    }
  } catch (error) {
    console.error('Error handling bounce notification:', error)
  }
}

/**
 * Get campaign analytics summary
 */
export async function getCampaignAnalytics(campaignId: string) {
  try {
    const supabase = createServerClient()
    
    const { data: analytics, error } = await supabase
      .from('campaign_analytics')
      .select('event_type')
      .eq('campaign_id', campaignId)
    
    if (error) {
      console.error('Error fetching campaign analytics:', error)
      return null
    }
    
    const summary = analytics.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      sent: summary.sent || 0,
      delivered: summary.delivered || 0,
      bounced: summary.bounced || 0,
      complaints: summary.complaint || 0,
      opened: summary.opened || 0,
      clicked: summary.clicked || 0,
    }
  } catch (error) {
    console.error('Error getting campaign analytics:', error)
    return null
  }
} 