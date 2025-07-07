'use client'

import React, { useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { EmailTemplate } from '@/types/supabase'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface EmailEditorProps {
  value: string
  onChange: (content: string) => void
  template?: EmailTemplate
  placeholder?: string
}

export function EmailEditor({
  value,
  onChange,
  template,
  placeholder = 'Start writing your email content...',
}: EmailEditorProps) {
  
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  }), [])

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link', 'image',
    'align',
    'color', 'background',
  ]

  const handleChange = useCallback((content: string) => {
    onChange(content)
  }, [onChange])

  const getPlaceholderText = () => {
    switch (template) {
      case 'newsletter':
        return 'Write your newsletter content here. You can include updates, news, and valuable information for your subscribers...'
      case 'promotional':
        return 'Create your promotional content here. Highlight your offer, benefits, and include a clear call-to-action...'
      case 'welcome':
        return 'Welcome your new subscribers! Introduce yourself, set expectations, and provide helpful getting started information...'
      default:
        return placeholder
    }
  }

  return (
    <div className="space-y-4">
      <div className="min-h-[300px] bg-white rounded-lg border">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={getPlaceholderText()}
          className="h-full email-editor"
          style={{ 
            height: '280px'
          }}
        />
      </div>
      
      {template && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
          <strong>Template: {template}</strong>
          <br />
          {template === 'newsletter' && 'Perfect for regular updates and news sharing.'}
          {template === 'promotional' && 'Great for announcements, offers, and marketing campaigns.'}
          {template === 'welcome' && 'Ideal for greeting new subscribers and setting expectations.'}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        <strong>Tips:</strong> Use headings to structure your content, keep paragraphs short for better readability, 
        and include links to drive engagement. Images should be web-optimized and have alt text.
      </div>
    </div>
  )
} 