import Link from 'next/link'
import { Button } from '@/app/components/ui/button'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to NextMailer Personal
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your self-hosted email marketing platform. Create, manage, and send 
          beautiful email campaigns to your subscribers with ease.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600 text-lg">📝</span>
            </div>
            <h3 className="text-lg font-semibold">Create Campaign</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Start a new email campaign with our easy-to-use editor and templates.
          </p>
          <Link href="/campaigns/new">
            <Button className="w-full">
              New Campaign
            </Button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-green-600 text-lg">📊</span>
            </div>
            <h3 className="text-lg font-semibold">View Campaigns</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Manage your existing campaigns and view performance analytics.
          </p>
          <Link href="/campaigns">
            <Button variant="outline" className="w-full">
              All Campaigns
            </Button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-600 text-lg">👥</span>
            </div>
            <h3 className="text-lg font-semibold">Subscribers</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Manage your email lists and subscriber information.
          </p>
          <Button variant="outline" className="w-full" disabled>
            Coming Soon
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-orange-600 text-lg">⚙️</span>
            </div>
            <h3 className="text-lg font-semibold">Settings</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Configure AWS SES credentials and email settings for testing.
          </p>
          <Link href="/settings">
            <Button variant="outline" className="w-full">
              Configure AWS SES
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-blue-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Beautiful Templates</h4>
                <p className="text-gray-600">Choose from newsletter, promotional, and welcome email templates.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-blue-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">WYSIWYG Editor</h4>
                <p className="text-gray-600">Edit your emails with a powerful and intuitive rich text editor.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-blue-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Reliable Delivery</h4>
                <p className="text-gray-600">Powered by Amazon SES for high deliverability and scalability.</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-blue-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Analytics</h4>
                <p className="text-gray-600">Track email delivery, opens, clicks, and bounce rates.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-blue-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Self-Hosted</h4>
                <p className="text-gray-600">Deploy on Vercel with your own database and email service.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-blue-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Privacy First</h4>
                <p className="text-gray-600">Your data stays in your control with complete privacy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to get started?
        </h2>
        <p className="text-gray-600 mb-6">
          Create your first email campaign and start engaging with your audience.
        </p>
        <Link href="/campaigns/new">
          <Button size="lg">
            Create Your First Campaign
          </Button>
        </Link>
      </div>
    </div>
  )
} 