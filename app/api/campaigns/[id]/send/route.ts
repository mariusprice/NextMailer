import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendBulkEmails, EmailData } from '@/lib/aws-ses'
import { renderNewsletterTemplate } from '@/templates/newsletter'
import { renderPromotionalTemplate } from '@/templates/promotional'
import { renderWelcomeTemplate } from '@/templates/welcome'
import sanitizeHtml from 'sanitize-html'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = createServerClient()
    
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        email_lists (
          id,
          name
        )
      `)
      .eq('id', campaignId)
      .single()
    
    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    // Check if campaign is in draft status
    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Campaign is not in draft status' },
        { status: 400 }
      )
    }
    
    // Get active subscribers for the email list
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('id, email, first_name, last_name')
      .eq('email_list_id', campaign.email_list_id)
      .eq('status', 'active')
    
    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError)
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }
    
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers found' },
        { status: 400 }
      )
    }
    
    // Update campaign status to 'sending'
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: 'sending',
        sent_at: new Date().toISOString(),
        recipient_count: subscribers.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
    
    if (updateError) {
      console.error('Error updating campaign status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update campaign status' },
        { status: 500 }
      )
    }
    
    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(campaign.content, {
      allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'b', 'em', 'i', 'u',
        'ul', 'ol', 'li',
        'a', 'img',
        'div', 'span',
        'blockquote'
      ],
      allowedAttributes: {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'width', 'height'],
        '*': ['style']
      },
      allowedStyles: {
        '*': {
          'color': [/^#[0-9a-fA-F]{6}$/, /^rgb\(\d+,\s*\d+,\s*\d+\)$/],
          'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
          'font-weight': [/^bold$/, /^normal$/],
          'font-style': [/^italic$/, /^normal$/],
          'text-decoration': [/^underline$/, /^none$/]
        }
      }
    })
    
    // Prepare email data for all subscribers
    const emailsToSend: EmailData[] = subscribers.map(subscriber => {
      const subscriberName = [subscriber.first_name, subscriber.last_name]
        .filter(Boolean)
        .join(' ') || undefined
      
      // Generate email HTML based on template
      let emailHtml: string
      
      const templateProps = {
        content: sanitizedContent,
        subject: campaign.subject,
        subscriberName,
        unsubscribeUrl: `${process.env.NEXTAUTH_URL}/unsubscribe?token=${subscriber.id}`,
      }
      
      switch (campaign.template_id) {
        case 'newsletter':
          emailHtml = renderNewsletterTemplate(templateProps)
          break
        case 'promotional':
          emailHtml = renderPromotionalTemplate({
            ...templateProps,
            ctaText: 'Learn More',
            ctaUrl: process.env.NEXTAUTH_URL,
          })
          break
        case 'welcome':
          emailHtml = renderWelcomeTemplate(templateProps)
          break
        default:
          emailHtml = renderNewsletterTemplate(templateProps)
      }
      
      return {
        to: subscriber.email,
        subject: campaign.subject,
        htmlBody: emailHtml,
        fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
        fromName: 'NextMailer Personal',
      }
    })
    
    // Send emails asynchronously
    const sendResult = await sendBulkEmails(
      emailsToSend,
      campaignId,
      (sent, total) => {
        console.log(`Campaign ${campaignId}: ${sent}/${total} emails processed`)
      }
    )
    
    // Update campaign status based on results
    const finalStatus = sendResult.failed === 0 ? 'sent' : 
                       sendResult.successful > 0 ? 'sent' : 'failed'
    
    await supabase
      .from('campaigns')
      .update({
        status: finalStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
    
    return NextResponse.json({
      success: true,
      message: 'Campaign sent successfully',
      results: {
        total: emailsToSend.length,
        successful: sendResult.successful,
        failed: sendResult.failed,
      }
    })
    
  } catch (error) {
    console.error('Error in POST /api/campaigns/[id]/send:', error)
    
    // Update campaign status to failed
    try {
      const supabase = createServerClient()
      await supabase
        .from('campaigns')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
    } catch (updateError) {
      console.error('Error updating campaign status to failed:', updateError)
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 