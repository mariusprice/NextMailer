import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NextMailer Personal - Email Campaign Management',
  description: 'Self-hosted email marketing platform for personal use',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {/* Navigation */}
          <nav className="border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-primary">
                    NextMailer Personal
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <a 
                    href="/campaigns" 
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Campaigns
                  </a>
                  <a 
                    href="/campaigns/new" 
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
                  >
                    New Campaign
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 