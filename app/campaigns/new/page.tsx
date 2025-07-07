'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CampaignForm } from '@/app/components/campaign-form'
import { createClient } from '@/lib/supabase/client'

interface EmailList {
  id: string
  name: string
  subscriber_count: number
}

export default function NewCampaignPage() {
  const router = useRouter()
  const [emailLists, setEmailLists] = useState<EmailList[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingLists, setIsLoadingLists] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch email lists on component mount
  useEffect(() => {
    const fetchEmailLists = async () => {
      try {
        const response = await fetch('/api/lists')
        if (!response.ok) {
          throw new Error('Failed to fetch email lists')
        }
        const data = await response.json()
        setEmailLists(data.emailLists || [])
      } catch (err) {
        console.error('Error fetching email lists:', err)
        setError('Failed to load email lists')
      } finally {
        setIsLoadingLists(false)
      }
    }

    fetchEmailLists()
  }, [])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create campaign')
      }

      const result = await response.json()
      
      // Redirect to the campaign detail page
      router.push(`/campaigns/${result.campaign.id}`)
    } catch (err) {
      console.error('Error creating campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendNow = async (data: any) => {
    setIsSending(true)
    setError(null)

    try {
      // First create the campaign
      const createResponse = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || 'Failed to create campaign')
      }

      const createResult = await createResponse.json()
      const campaignId = createResult.campaign.id

      // Then send the campaign immediately
      const sendResponse = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: 'POST',
      })

      if (!sendResponse.ok) {
        const errorData = await sendResponse.json()
        throw new Error(errorData.error || 'Failed to send campaign')
      }

      const sendResult = await sendResponse.json()
      
      // Show success message and redirect
      alert(`Campaign sent successfully! ${sendResult.results.successful} emails sent.`)
      router.push(`/campaigns/${campaignId}`)
    } catch (err) {
      console.error('Error sending campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to send campaign')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoadingLists) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading email lists...</p>
        </div>
      </div>
    )
  }

  if (emailLists.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          No Email Lists Found
        </h1>
        <p className="text-gray-600 mb-6">
          You need at least one email list with subscribers to create a campaign.
        </p>
        <p className="text-sm text-gray-500">
          Please set up your email lists in your Supabase database first.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Campaign
        </h1>
        <p className="text-gray-600">
          Design and send beautiful email campaigns to your subscribers.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <CampaignForm
          emailLists={emailLists}
          onSubmit={handleSubmit}
          onSendNow={handleSendNow}
          isLoading={isLoading}
          isSending={isSending}
        />
      </div>
    </div>
  )
} 