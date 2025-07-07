import React from 'react'

interface WelcomeTemplateProps {
  content: string
  subject: string
  subscriberName?: string
  unsubscribeUrl?: string
}

export function WelcomeTemplate({
  content,
  subject,
  subscriberName,
  unsubscribeUrl
}: WelcomeTemplateProps) {
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
            background-color: #f0f9ff;
          }
          .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
            color: white;
            text-align: center;
            padding: 40px 20px;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 20px;
            background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
            border-radius: 0 0 50% 50%;
          }
          .welcome-icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .tagline {
            font-size: 18px;
            opacity: 0.9;
          }
          .content {
            padding: 50px 40px 40px;
          }
          .greeting {
            font-size: 24px;
            margin-bottom: 30px;
            color: #0f172a;
            text-align: center;
            font-weight: 600;
          }
          .welcome-message {
            background-color: #f0f9ff;
            border-left: 4px solid #06b6d4;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
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
            border-radius: 8px;
          }
          .highlights {
            background-color: #f8fafc;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
          }
          .highlights h3 {
            color: #1e293b;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .highlights ul {
            color: #4b5563;
            padding-left: 20px;
          }
          .highlights li {
            margin-bottom: 8px;
          }
          .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e2e8f0;
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
              padding: 30px 15px;
            }
            .welcome-icon {
              font-size: 36px;
            }
            .logo {
              font-size: 28px;
            }
            .content {
              padding: 30px 25px 25px;
            }
            .greeting {
              font-size: 20px;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="welcome-icon">🎉</div>
            <div className="logo">NextMailer</div>
            <div className="tagline">Welcome to the Community!</div>
          </div>
          
          <div className="content">
            <div className="greeting">
              Welcome{subscriberName ? `, ${subscriberName}` : ''}!
            </div>
            
            <div className="welcome-message">
              <p><strong>Thank you for joining us!</strong> We're thrilled to have you as part of our community. You'll receive valuable updates, insights, and exclusive content directly in your inbox.</p>
            </div>
            
            <div dangerouslySetInnerHTML={{ __html: content }} />
            
            <div className="highlights">
              <h3>What to expect:</h3>
              <ul>
                <li>📧 Regular updates with valuable content</li>
                <li>🎯 Relevant information tailored to your interests</li>
                <li>🔒 Your privacy is protected - we never share your email</li>
                <li>✨ Exclusive insights and early access to new features</li>
              </ul>
            </div>
          </div>
          
          <div className="footer">
            <p>We're excited to have you on board!</p>
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

export function renderWelcomeTemplate(props: WelcomeTemplateProps): string {
  // For server-side rendering in API routes, we'll use a different approach
  const { renderToString } = require('react-dom/server')
  return `<!DOCTYPE html>${renderToString(<WelcomeTemplate {...props} />)}`
} 