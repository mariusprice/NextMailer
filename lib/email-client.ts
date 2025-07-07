'use client'

export interface AwsSettings {
  accessKeyId: string
  secretAccessKey: string
  region: string
  fromEmail: string
  fromName: string
}

export interface EmailData {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Get AWS settings from localStorage
 */
export function getAwsSettings(): AwsSettings | null {
  if (typeof window === 'undefined') return null
  
  const saved = localStorage.getItem('aws-settings')
  if (!saved) return null
  
  try {
    return JSON.parse(saved)
  } catch {
    return null
  }
}

/**
 * Check if AWS is configured
 */
export function isAwsConfigured(): boolean {
  const settings = getAwsSettings()
  return !!(settings?.accessKeyId && settings?.secretAccessKey && settings?.fromEmail)
}

/**
 * Send email using dynamic AWS credentials
 */
export async function sendEmailWithCredentials(emailData: EmailData): Promise<SendEmailResult> {
  const settings = getAwsSettings()
  
  if (!settings) {
    return {
      success: false,
      error: 'AWS credentials not configured. Please go to Settings to configure AWS SES.'
    }
  }

  if (!settings.accessKeyId || !settings.secretAccessKey || !settings.fromEmail) {
    return {
      success: false,
      error: 'Incomplete AWS configuration. Please check your settings.'
    }
  }

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        awsCredentials: {
          accessKeyId: settings.accessKeyId,
          secretAccessKey: settings.secretAccessKey,
          region: settings.region,
        },
        emailData: {
          ...emailData,
          fromEmail: settings.fromEmail,
          fromName: settings.fromName,
        },
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to send email',
      }
    }

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Send test email to verify configuration
 */
export async function sendTestEmail(testEmailAddress: string): Promise<SendEmailResult> {
  const settings = getAwsSettings()
  
  return sendEmailWithCredentials({
    to: testEmailAddress,
    subject: 'Test Email from NextMailer Personal',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">🎉 Congratulations!</h2>
        <p>Your AWS SES configuration is working correctly.</p>
        <p>This test email was sent from NextMailer Personal to verify your email sending setup.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          <strong>From:</strong> ${settings?.fromName || 'NextMailer Personal'} &lt;${settings?.fromEmail}&gt;<br>
          <strong>Region:</strong> ${settings?.region}<br>
          <strong>Sent at:</strong> ${new Date().toLocaleString()}
        </p>
      </div>
    `,
    textBody: `
Congratulations! Your AWS SES configuration is working correctly.

This test email was sent from NextMailer Personal to verify your email sending setup.

From: ${settings?.fromName || 'NextMailer Personal'} <${settings?.fromEmail}>
Region: ${settings?.region}
Sent at: ${new Date().toLocaleString()}
    `,
  })
} 