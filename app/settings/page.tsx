'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { sendTestEmail } from '@/lib/email-client'

interface AwsSettings {
  accessKeyId: string
  secretAccessKey: string
  region: string
  fromEmail: string
  fromName: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AwsSettings>({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    fromEmail: '',
    fromName: ''
  })
  const [saved, setSaved] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('aws-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
      setIsConfigured(true)
    }
  }, [])

  const handleSave = () => {
    // Validate required fields
    if (!settings.accessKeyId || !settings.secretAccessKey || !settings.fromEmail) {
      alert('Please fill in all required fields')
      return
    }

    // Save to localStorage
    localStorage.setItem('aws-settings', JSON.stringify(settings))
    setSaved(true)
    setIsConfigured(true)
    
    setTimeout(() => setSaved(false), 3000)
  }

  const handleClear = () => {
    localStorage.removeItem('aws-settings')
    setSettings({
      accessKeyId: '',
      secretAccessKey: '',
      region: 'us-east-1',
      fromEmail: '',
      fromName: ''
    })
    setIsConfigured(false)
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter a test email address')
      return
    }

    if (!isConfigured) {
      alert('Please save your AWS configuration first')
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const result = await sendTestEmail(testEmail)
      setTestResult({
        success: result.success,
        message: result.success 
          ? `Test email sent successfully! Message ID: ${result.messageId}`
          : result.error || 'Failed to send test email'
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error sending test email: ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AWS SES Configuration
        </h1>
        <p className="text-gray-600">
          Configure your AWS SES credentials to send emails. These settings are stored locally in your browser for testing purposes.
        </p>
      </div>

      {/* Status Banner */}
      {isConfigured && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 text-lg mr-2">✓</span>
            <span className="text-green-800 font-medium">
              AWS SES is configured and ready to use!
            </span>
          </div>
        </div>
      )}

      {!isConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-yellow-600 text-lg mr-2">⚠️</span>
            <span className="text-yellow-800 font-medium">
              AWS SES configuration required to send emails
            </span>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="accessKeyId">AWS Access Key ID *</Label>
            <Input
              id="accessKeyId"
              type="text"
              value={settings.accessKeyId}
              onChange={(e) => setSettings({...settings, accessKeyId: e.target.value})}
              placeholder="AKIA..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="secretAccessKey">AWS Secret Access Key *</Label>
            <Input
              id="secretAccessKey"
              type="password"
              value={settings.secretAccessKey}
              onChange={(e) => setSettings({...settings, secretAccessKey: e.target.value})}
              placeholder="Your AWS secret key"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="region">AWS Region</Label>
            <Input
              id="region"
              type="text"
              value={settings.region}
              onChange={(e) => setSettings({...settings, region: e.target.value})}
              placeholder="us-east-1"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="fromEmail">From Email Address *</Label>
            <Input
              id="fromEmail"
              type="email"
              value={settings.fromEmail}
              onChange={(e) => setSettings({...settings, fromEmail: e.target.value})}
              placeholder="noreply@yourdomain.com"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              This email must be verified in your AWS SES console
            </p>
          </div>

          <div>
            <Label htmlFor="fromName">From Name</Label>
            <Input
              id="fromName"
              type="text"
              value={settings.fromName}
              onChange={(e) => setSettings({...settings, fromName: e.target.value})}
              placeholder="Your Organization"
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleSave} className="flex-1">
            {saved ? 'Saved!' : 'Save Configuration'}
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear Settings
          </Button>
        </div>
      </div>

      {/* Test Email Section */}
      {isConfigured && (
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Test Your Configuration</h3>
          <p className="text-gray-600">
            Send a test email to verify your AWS SES configuration is working correctly.
          </p>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleTestEmail} 
                disabled={testing || !testEmail}
                className="whitespace-nowrap"
              >
                {testing ? 'Sending...' : 'Send Test Email'}
              </Button>
            </div>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start">
                <span className="mr-2 text-lg">
                  {testResult.success ? '✅' : '❌'}
                </span>
                <p className="font-medium">{testResult.message}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">How to get AWS SES credentials:</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Go to the <a href="https://console.aws.amazon.com/ses/" target="_blank" rel="noopener noreferrer" className="underline">AWS SES Console</a></li>
          <li>Verify your sending email address in the &quot;Verified identities&quot; section</li>
          <li>Go to IAM and create a new user with SES sending permissions</li>
          <li>Generate access keys for that user</li>
          <li>Copy the credentials and paste them above</li>
        </ol>
      </div>
    </div>
  )
} 