import React from 'react'

interface NewsletterTemplateProps {
  content: string
  subject: string
  subscriberName?: string
  unsubscribeUrl?: string
}

export function NewsletterTemplate({
  content,
  subject,
  subscriberName,
  unsubscribeUrl
}: NewsletterTemplateProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{subject}</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .tagline {
            color: #666;
            font-size: 14px;
          }
          .content {
            margin: 30px 0;
          }
          .content h1 {
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content h2 {
            color: #374151;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          .content p {
            margin-bottom: 15px;
            line-height: 1.7;
          }
          .content img {
            max-width: 100%;
            height: auto;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          .unsubscribe {
            margin-top: 10px;
          }
          .unsubscribe a {
            color: #6b7280;
            text-decoration: underline;
          }
          @media only screen and (max-width: 600px) {
            body {
              padding: 10px;
            }
            .header {
              padding: 15px 0;
            }
            .logo {
              font-size: 20px;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <div className="logo">NextMailer</div>
          <div className="tagline">Your Personal Newsletter</div>
        </div>
        
        {subscriberName && (
          <p>Hello {subscriberName},</p>
        )}
        
        <div 
          className="content" 
          dangerouslySetInnerHTML={{ __html: content }}
        />
        
        <div className="footer">
          <p>Thank you for subscribing to our newsletter!</p>
          <p>© 2024 NextMailer Personal. All rights reserved.</p>
          {unsubscribeUrl && (
            <div className="unsubscribe">
              <a href={unsubscribeUrl}>Unsubscribe from this list</a>
            </div>
          )}
        </div>
      </body>
    </html>
  )
}

export function renderNewsletterTemplate(props: NewsletterTemplateProps): string {
  // For server-side rendering in API routes, we'll use a different approach
  const { renderToString } = require('react-dom/server')
  return `<!DOCTYPE html>${renderToString(<NewsletterTemplate {...props} />)}`
} 