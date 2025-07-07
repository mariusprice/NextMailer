# NextMailer Personal

A self-hosted email marketing platform built with Next.js 14+, designed for personal use with professional features.

## Features

- **Campaign Management**: Create, edit, and send email campaigns with beautiful templates
- **Template System**: Pre-built responsive templates (Newsletter, Promotional, Welcome)
- **WYSIWYG Editor**: Rich text editor powered by React Quill
- **Email Lists**: Manage subscribers with status tracking
- **AWS SES Integration**: Reliable email delivery with bounce handling
- **Analytics**: Track campaign performance and delivery status
- **Responsive Design**: Modern UI with Tailwind CSS and Shadcn/ui

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Email Service**: AWS SES
- **Deployment**: Vercel (preferred)
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Editor**: React Quill

## Prerequisites

- Node.js 18+
- Supabase account
- AWS account with SES configured
- Verified email domain/address in AWS SES

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd nextmailer-personal
npm install
```

### 2. Environment Variables

Copy the example environment file and configure your variables:

```bash
cp env.example .env.local
```

Fill in your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AWS SES Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region

# Email Configuration
FROM_EMAIL=your_verified_ses_email@example.com
FROM_NAME=Your Name or Organization
```

### 3. Database Setup

Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
-- Create email_lists table
CREATE TABLE email_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscribers table
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_list_id UUID NOT NULL REFERENCES email_lists(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email_list_id, email)
);

-- Create campaigns table
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_list_id UUID NOT NULL REFERENCES email_lists(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  template_id VARCHAR(50) DEFAULT 'newsletter',
  status VARCHAR(20) DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_analytics table
CREATE TABLE campaign_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_subscribers_email_list_id ON subscribers(email_list_id);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_event_type ON campaign_analytics(event_type);
```

### 4. AWS SES Setup

1. Verify your email address or domain in AWS SES
2. Create IAM user with SES permissions
3. Generate access keys for the IAM user
4. If in sandbox mode, verify recipient emails

### 5. Development

```bash
npm run dev
```

Visit `http://localhost:3000` to start using the application.

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with PM2

## Usage

1. **Create Email List**: Start by creating your first email list
2. **Add Subscribers**: Import or manually add subscriber emails
3. **Create Campaign**: Choose a template and compose your email
4. **Send Campaign**: Review and send to your email list
5. **Track Performance**: Monitor delivery and engagement metrics

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── campaigns/         # Campaign pages
│   ├── components/        # React components
│   └── globals.css        # Global styles
├── lib/                   # Utility functions
│   ├── aws-ses.ts        # AWS SES integration
│   └── supabase/         # Supabase clients
├── templates/             # Email templates
├── types/                 # TypeScript types
└── supabase/functions/    # Edge functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, create an issue in the repository or contact the maintainer. 