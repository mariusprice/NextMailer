import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createCampaignSchema = z.object({
  email_list_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  subject: z.string().min(1).max(255),
  content: z.string().min(1),
  template_id: z.enum(['newsletter', 'promotional', 'welcome']).optional(),
})

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        email_lists (
          id,
          name,
          subscriber_count
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error in GET /api/campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = createCampaignSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      )
    }
    
    const { email_list_id, name, subject, content, template_id } = validationResult.data
    
    const supabase = createServerClient()
    
    // Verify the email list exists
    const { data: emailList, error: emailListError } = await supabase
      .from('email_lists')
      .select('id, subscriber_count')
      .eq('id', email_list_id)
      .single()
    
    if (emailListError || !emailList) {
      return NextResponse.json(
        { error: 'Email list not found' },
        { status: 404 }
      )
    }
    
    // Create the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        email_list_id,
        name,
        subject,
        content,
        template_id,
        status: 'draft',
        recipient_count: emailList.subscriber_count,
      })
      .select()
      .single()
    
    if (campaignError) {
      console.error('Error creating campaign:', campaignError)
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 