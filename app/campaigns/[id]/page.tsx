'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  subject: string
  content: string
  template_id: string
  status: string
  sent_at: string | null
  recipient_count: number
  created_at: string
  updated_at: string
  email_lists: {
    id: string
    name: string
    subscriber_count: number
  }
  analytics?: {
    sent: number
    delivered: number
    bounced: number
    complaints: number
    opened: number
    clicked: number
  }
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const campaignId = params.id as string

  useEffect(() => {
    if (!campaignId) return

    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch campaign')
        }
        const data = await response.json()
        setCampaign(data.campaign)
      } catch (err) {
        console.error('Error fetching campaign:', err)
        setError('Failed to load campaign')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaign()
  }, [campaignId])

  const handleSendCampaign = async () => {
    if (!campaign || campaign.status !== 'draft') return

    setIsSending(true)
    setError(null)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send campaign')
      }

      const result = await response.json()
      
      // Update campaign state
      setCampaign(prev => prev ? { ...prev, status: 'sent', sent_at: new Date().toISOString() } : null)
      
      alert(`Campaign sent successfully! ${result.results.successful} emails sent.`)
    } catch (err) {
      console.error('Error sending campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to send campaign')
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteCampaign = async () => {
    if (!campaign || campaign.status === 'sent') return
    
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete campaign')
      }

      router.push('/campaigns')
    } catch (err) {
      console.error('Error deleting campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete campaign')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sending': return 'bg-blue-100 text-blue-800'
      case 'sent': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Campaign Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          {error || 'The campaign you are looking for does not exist.'}
        </p>
        <Link href="/campaigns">
          <Button>Back to Campaigns</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {campaign.name}
            </h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
          <p className="text-gray-600">
            Created on {new Date(campaign.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          {campaign.status === 'draft' && (
            <>
              <Button
                onClick={handleSendCampaign}
                disabled={isSending}
              >
                {isSending ? 'Sending...' : 'Send Campaign'}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/campaigns/${campaignId}/edit`}>Edit</Link>
              </Button>
            </>
          )}
          {campaign.status !== 'sent' && (
            <Button 
              variant="destructive" 
              onClick={handleDeleteCampaign}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Subject</label>
                <p className="text-gray-900">{campaign.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email List</label>
                <p className="text-gray-900">{campaign.email_lists.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Template</label>
                <p className="text-gray-900 capitalize">{campaign.template_id || 'Custom'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Recipients</label>
                <p className="text-gray-900">{campaign.recipient_count} subscribers</p>
              </div>
              {campaign.sent_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Sent At</label>
                  <p className="text-gray-900">
                    {new Date(campaign.sent_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Analytics */}
          {campaign.analytics && campaign.status === 'sent' && (
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-lg font-semibold mb-4">Analytics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {campaign.analytics.sent}
                  </div>
                  <div className="text-sm text-gray-600">Sent</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {campaign.analytics.delivered}
                  </div>
                  <div className="text-sm text-gray-600">Delivered</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {campaign.analytics.bounced}
                  </div>
                  <div className="text-sm text-gray-600">Bounced</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {campaign.analytics.opened}
                  </div>
                  <div className="text-sm text-gray-600">Opened</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Content Preview</h2>
          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <div className="bg-white rounded-md p-4">
              <div className="text-sm text-gray-500 mb-2">
                Subject: {campaign.subject}
              </div>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: campaign.content }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 