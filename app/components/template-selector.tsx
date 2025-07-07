'use client'

import React from 'react'
import { EmailTemplate } from '@/types/supabase'
import { cn } from '@/lib/utils'

interface TemplateSelectorProps {
  selectedTemplate?: EmailTemplate
  onTemplateChange: (template: EmailTemplate) => void
}

const templates: Array<{
  id: EmailTemplate
  name: string
  description: string
  preview: string
  icon: string
}> = [
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Perfect for regular updates, news, and content sharing',
    preview: 'Clean, readable layout with header and structured content sections',
    icon: '📰',
  },
  {
    id: 'promotional',
    name: 'Promotional',
    description: 'Ideal for marketing campaigns, offers, and announcements',
    preview: 'Eye-catching design with prominent call-to-action button',
    icon: '🎯',
  },
  {
    id: 'welcome',
    name: 'Welcome',
    description: 'Great for onboarding new subscribers and setting expectations',
    preview: 'Warm, inviting design with highlights and getting started info',
    icon: '👋',
  },
]

export function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={cn(
              'relative rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md',
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{template.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {template.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {template.preview}
                </p>
              </div>
            </div>
            
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {selectedTemplate && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            Selected: {templates.find(t => t.id === selectedTemplate)?.name}
          </h4>
          <p className="text-sm text-gray-600">
            {templates.find(t => t.id === selectedTemplate)?.description}
          </p>
        </div>
      )}
    </div>
  )
} 