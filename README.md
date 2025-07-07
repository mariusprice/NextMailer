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

## Deployment to Vercel (Recommended)

### 1. Quick Deploy

Click the button below to deploy directly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mariusprice/NextMailer)

### 2. Manual Import

1. **Import Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Import Git Repository"
   - Select your `NextMailer` repository

2. **Configure Environment Variables**:
   During import, add the following environment variables in the Vercel dashboard:

   ```
   # Supabase Configuration (Get these from your Supabase project settings)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AWS SES Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1

   # Email Configuration
   FROM_EMAIL=your_verified_ses_email@example.com
   FROM_NAME=Your Name or Organization
   ```

3. **Deploy**: Click "Deploy" and Vercel will build and deploy your application

### 3. Supabase Setup

After deployment, set up your Supabase database:

1. **Create Supabase Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project
   - Copy the project URL and keys

2. **Run Database Schema**:
   In your Supabase SQL editor, run:

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

3. **Update Environment Variables**:
   - Go back to your Vercel project settings
   - Update the Supabase environment variables with your actual values
   - Redeploy if necessary

## Local Development

### 1. Clone and Install

```bash
git clone https://github.com/mariusprice/NextMailer.git
cd NextMailer
npm install
```

### 2. Environment Variables

Create `.env.local` file:

```bash
cp env.example .env.local
```

Fill in your environment variables based on your Supabase and AWS configurations.

### 3. Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to start using the application.

## AWS SES Setup

1. Verify your email address or domain in AWS SES
2. Create IAM user with SES permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ses:SendEmail",
           "ses:SendRawEmail"
         ],
         "Resource": "*"
       }
     ]
   }
   ```
3. Generate access keys for the IAM user
4. If in sandbox mode, verify recipient emails

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

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key | Yes | `eyJ0eXAiOiJKV1QiLCJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (private) | Yes | `eyJ0eXAiOiJKV1QiLCJhbGc...` |
| `AWS_ACCESS_KEY_ID` | AWS access key for SES | Yes | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for SES | Yes | `wJalrXUtnFEMI/K7MDENG/...` |
| `AWS_REGION` | AWS region for SES | Yes | `us-east-1` |
| `FROM_EMAIL` | Verified sender email in SES | Yes | `hello@yourdomain.com` |
| `FROM_NAME` | Sender name for emails | Yes | `Your Company` |

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