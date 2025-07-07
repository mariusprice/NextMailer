'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { EmailEditor } from './email-editor'
import { TemplateSelector } from './template-selector'
import { EmailTemplate } from '@/types/supabase'

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(255),
  subject: z.string().min(1, 'Subject is required').max(255),
  content: z.string().min(1, 'Content is required'),
  template_id: z.enum(['newsletter', 'promotional', 'welcome']).optional(),
  email_list_id: z.string().uuid('Please select an email list'),
})

type CampaignFormData = z.infer<typeof campaignSchema>

interface CampaignFormProps {
  emailLists: Array<{
    id: string
    name: string
    subscriber_count: number
  }>
  onSubmit: (data: CampaignFormData) => Promise<void>
  onSendNow?: (data: CampaignFormData) => Promise<void>
  isLoading?: boolean
  isSending?: boolean
  initialData?: Partial<CampaignFormData>
}

export function CampaignForm({
  emailLists,
  onSubmit,
  onSendNow,
  isLoading = false,
  isSending = false,
  initialData,
}: CampaignFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | undefined>(
    initialData?.template_id || 'newsletter'
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: initialData?.name || '',
      subject: initialData?.subject || '',
      content: initialData?.content || '',
      template_id: initialData?.template_id || 'newsletter',
      email_list_id: initialData?.email_list_id || '',
    },
  })

  const watchedContent = watch('content')

  const handleContentChange = (content: string) => {
    setValue('content', content, { shouldValidate: true })
  }

  const handleTemplateChange = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setValue('template_id', template, { shouldValidate: true })
  }

  const handleEmailListChange = (value: string) => {
    setValue('email_list_id', value, { shouldValidate: true })
  }

  const onFormSubmit = async (data: CampaignFormData) => {
    await onSubmit(data)
  }

  const onSendNowClick = async (data: CampaignFormData) => {
    if (onSendNow) {
      await onSendNow(data)
    }
  }

  return (
    <div className="space-y-8">
      <form className="space-y-6">
        {/* Campaign Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter campaign name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Email Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            {...register('subject')}
            placeholder="Enter email subject"
            className={errors.subject ? 'border-red-500' : ''}
          />
          {errors.subject && (
            <p className="text-sm text-red-500">{errors.subject.message}</p>
          )}
        </div>

        {/* Email List Selection */}
        <div className="space-y-2">
          <Label htmlFor="email_list">Email List</Label>
          <Select onValueChange={handleEmailListChange} defaultValue={initialData?.email_list_id}>
            <SelectTrigger className={errors.email_list_id ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select an email list" />
            </SelectTrigger>
            <SelectContent>
              {emailLists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name} ({list.subscriber_count} subscribers)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.email_list_id && (
            <p className="text-sm text-red-500">{errors.email_list_id.message}</p>
          )}
        </div>

        {/* Template Selection */}
        <div className="space-y-2">
          <Label>Email Template</Label>
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateChange}
          />
        </div>

        {/* Content Editor */}
        <div className="space-y-2">
          <Label htmlFor="content">Email Content</Label>
          <EmailEditor
            value={watchedContent}
            onChange={handleContentChange}
            template={selectedTemplate}
          />
          {errors.content && (
            <p className="text-sm text-red-500">{errors.content.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit(onFormSubmit)}
            disabled={isLoading || isSending}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Save as Draft'}
          </Button>
          
          {onSendNow && (
            <Button
              type="button"
              onClick={handleSubmit(onSendNowClick)}
              disabled={isLoading || isSending}
              className="flex-1"
            >
              {isSending ? 'Sending...' : 'Send Now'}
            </Button>
          )}
        </div>
      </form>

      {/* Preview Section */}
      {watchedContent && selectedTemplate && (
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="bg-white rounded-md p-6 max-w-2xl mx-auto">
              <div className="text-sm text-gray-500 mb-2">
                Template: {selectedTemplate}
              </div>
              <div className="text-lg font-semibold mb-4">
                {watch('subject') || 'Email Subject'}
              </div>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: watchedContent }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 