import React from 'react'

interface PromotionalTemplateProps {
  content: string
  subject: string
  subscriberName?: string
  ctaText?: string
  ctaUrl?: string
  unsubscribeUrl?: string
}

export function PromotionalTemplate({
  content,
  subject,
  subscriberName,
  ctaText = 'Learn More',
  ctaUrl,
  unsubscribeUrl
}: PromotionalTemplateProps) {
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
            background-color: #f8fafc;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 30px 20px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .tagline {
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #374151;
          }
          .content h1 {
            color: #1f2937;
            margin-bottom: 20px;
            font-size: 24px;
          }
          .content h2 {
            color: #374151;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          .content p {
            margin-bottom: 15px;
            line-height: 1.7;
            color: #4b5563;
          }
          .content img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
          }
          .cta-section {
            text-align: center;
            margin: 40px 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          .unsubscribe {
            margin-top: 15px;
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
              padding: 20px 15px;
            }
            .logo {
              font-size: 24px;
            }
            .content {
              padding: 30px 20px;
            }
            .cta-button {
              padding: 14px 28px;
              font-size: 14px;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="logo">NextMailer</div>
            <div className="tagline">Promotional Update</div>
          </div>
          
          <div className="content">
            {subscriberName && (
              <div className="greeting">Hi {subscriberName}! 👋</div>
            )}
            
            <div dangerouslySetInnerHTML={{ __html: content }} />
            
            {ctaUrl && (
              <div className="cta-section">
                <a href={ctaUrl} className="cta-button">
                  {ctaText}
                </a>
              </div>
            )}
          </div>
          
          <div className="footer">
            <p>Thank you for being a valued subscriber!</p>
            <p>© 2024 NextMailer Personal. All rights reserved.</p>
            {unsubscribeUrl && (
              <div className="unsubscribe">
                <a href={unsubscribeUrl}>Unsubscribe from this list</a>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}

export function renderPromotionalTemplate(props: PromotionalTemplateProps): string {
  // For server-side rendering in API routes, we'll use a different approach
  const { renderToString } = require('react-dom/server')
  return `<!DOCTYPE html>${renderToString(<PromotionalTemplate {...props} />)}`
} 