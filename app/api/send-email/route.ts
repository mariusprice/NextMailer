import { NextRequest, NextResponse } from 'next/server'
import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
  SendEmailCommandOutput,
} from '@aws-sdk/client-ses'

export interface EmailRequest {
  awsCredentials: {
    accessKeyId: string
    secretAccessKey: string
    region: string
  }
  emailData: {
    to: string
    subject: string
    htmlBody: string
    textBody?: string
    fromEmail: string
    fromName?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { awsCredentials, emailData }: EmailRequest = await request.json()

    // Validate required fields
    if (!awsCredentials?.accessKeyId || !awsCredentials?.secretAccessKey || !awsCredentials?.region) {
      return NextResponse.json(
        { error: 'AWS credentials are required' },
        { status: 400 }
      )
    }

    if (!emailData?.to || !emailData?.subject || !emailData?.htmlBody || !emailData?.fromEmail) {
      return NextResponse.json(
        { error: 'Email data is incomplete' },
        { status: 400 }
      )
    }

    // Initialize SES client with dynamic credentials
    const sesClient = new SESClient({
      region: awsCredentials.region,
      credentials: {
        accessKeyId: awsCredentials.accessKeyId,
        secretAccessKey: awsCredentials.secretAccessKey,
      },
    })

    // Prepare email parameters
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

    // Send email
    const command = new SendEmailCommand(params)
    const result: SendEmailCommandOutput = await sesClient.send(command)

    return NextResponse.json({
      success: true,
      messageId: result.MessageId,
    })

  } catch (error) {
    console.error('Error sending email:', error)
    
    let errorMessage = 'Failed to send email'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    )
  }
} 