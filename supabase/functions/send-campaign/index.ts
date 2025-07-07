import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailData {
  to: string
  subject: string
  htmlBody: string
  fromEmail: string
  fromName?: string
}

interface SendEmailRequest {
  campaignId: string
  emails: EmailData[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { campaignId, emails }: SendEmailRequest = await req.json()

    if (!campaignId || !emails || !Array.isArray(emails)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let successful = 0
    let failed = 0

    // Send emails with rate limiting
    for (const emailData of emails) {
      try {
        // Send email using AWS SES
        const sendResult = await sendEmailWithSES(emailData)
        
        if (sendResult.success) {
          successful++
          
          // Log successful send to analytics
          await logEmailEvent(supabaseClient, campaignId, emailData.to, 'sent', {
            messageId: sendResult.messageId,
            timestamp: new Date().toISOString(),
          })
        } else {
          failed++
          
          // Log failed send to analytics
          await logEmailEvent(supabaseClient, campaignId, emailData.to, 'bounced', {
            error: sendResult.error,
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        failed++
        console.error(`Failed to send email to ${emailData.to}:`, error)
        
        // Log error to analytics
        await logEmailEvent(supabaseClient, campaignId, emailData.to, 'bounced', {
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      }
      
      // Rate limiting: wait 100ms between emails (10 emails per second)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Update campaign status
    const finalStatus = failed === 0 ? 'sent' : successful > 0 ? 'sent' : 'failed'
    
    await supabaseClient
      .from('campaigns')
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
        recipient_count: emails.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)

    return new Response(
      JSON.stringify({
        success: true,
        results: {
          total: emails.length,
          successful,
          failed,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-campaign function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendEmailWithSES(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const sesEndpoint = `https://email.${Deno.env.get('AWS_REGION')}.amazonaws.com/`
    
    const params = new URLSearchParams({
      'Action': 'SendEmail',
      'Version': '2010-12-01',
      'Source': emailData.fromName 
        ? `${emailData.fromName} <${emailData.fromEmail}>`
        : emailData.fromEmail,
      'Destination.ToAddresses.member.1': emailData.to,
      'Message.Subject.Data': emailData.subject,
      'Message.Subject.Charset': 'UTF-8',
      'Message.Body.Html.Data': emailData.htmlBody,
      'Message.Body.Html.Charset': 'UTF-8',
    })

    const headers = await createAWSHeaders('POST', '/', params.toString())

    const response = await fetch(sesEndpoint, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SES API error:', errorText)
      return { success: false, error: `SES API error: ${response.status}` }
    }

    const responseText = await response.text()
    const messageIdMatch = responseText.match(/<MessageId>(.*?)<\/MessageId>/)
    const messageId = messageIdMatch ? messageIdMatch[1] : undefined

    return { success: true, messageId }
  } catch (error) {
    console.error('Error sending email with SES:', error)
    return { success: false, error: error.message }
  }
}

async function createAWSHeaders(method: string, path: string, body: string) {
  const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
  const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
  const region = Deno.env.get('AWS_REGION')
  
  if (!accessKeyId || !secretAccessKey || !region) {
    throw new Error('AWS credentials not configured')
  }

  const service = 'ses'
  const host = `email.${region}.amazonaws.com`
  const now = new Date()
  const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '')
  const amzDate = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z'

  // Create canonical request
  const canonicalUri = path
  const canonicalQueryString = ''
  const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`
  const signedHeaders = 'host;x-amz-date'
  
  const encoder = new TextEncoder()
  const bodyHash = await crypto.subtle.digest('SHA-256', encoder.encode(body))
  const payloadHash = Array.from(new Uint8Array(bodyHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`

  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256'
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const canonicalRequestHash = await crypto.subtle.digest('SHA-256', encoder.encode(canonicalRequest))
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHashHex}`

  // Calculate signature
  const kDate = await hmacSha256(encoder.encode(`AWS4${secretAccessKey}`), dateStamp)
  const kRegion = await hmacSha256(kDate, region)
  const kService = await hmacSha256(kRegion, service)
  const kSigning = await hmacSha256(kService, 'aws4_request')
  const signature = await hmacSha256(kSigning, stringToSign)
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`

  return {
    'Authorization': authorizationHeader,
    'X-Amz-Date': amzDate,
    'Host': host,
  }
}

async function hmacSha256(key: Uint8Array | ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const encoder = new TextEncoder()
  return await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data))
}

async function logEmailEvent(
  supabaseClient: any,
  campaignId: string,
  email: string,
  eventType: string,
  eventData: any
): Promise<void> {
  try {
    // First, find the subscriber by email and campaign's email list
    const { data: campaign } = await supabaseClient
      .from('campaigns')
      .select('email_list_id')
      .eq('id', campaignId)
      .single()

    if (!campaign) {
      console.error('Campaign not found:', campaignId)
      return
    }

    const { data: subscriber } = await supabaseClient
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
    const { error } = await supabaseClient
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