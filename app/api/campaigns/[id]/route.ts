import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCampaignAnalytics } from '@/lib/aws-ses'
import { z } from 'zod'

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  subject: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  template_id: z.enum(['newsletter', 'promotional', 'welcome']).optional(),
  status: z.enum(['draft', 'sending', 'sent', 'failed']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = createServerClient()
    
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        email_lists (
          id,
          name,
          subscriber_count
        )
      `)
      .eq('id', id)
      .single()
    
    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    // Get campaign analytics
    const analytics = await getCampaignAnalytics(id)
    
    return NextResponse.json({
      campaign: {
        ...campaign,
        analytics
      }
    })
  } catch (error) {
    console.error('Error in GET /api/campaigns/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }
    
    // Validate request body
    const validationResult = updateCampaignSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      )
    }
    
    const updateData = validationResult.data
    const supabase = createServerClient()
    
    // Check if campaign exists and is not sent
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    // Don't allow editing sent campaigns (except status)
    if (existingCampaign.status === 'sent' && Object.keys(updateData).some(key => key !== 'status')) {
      return NextResponse.json(
        { error: 'Cannot edit sent campaigns' },
        { status: 400 }
      )
    }
    
    // Update the campaign
    const { data: campaign, error: updateError } = await supabase
      .from('campaigns')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating campaign:', updateError)
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error in PATCH /api/campaigns/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = createServerClient()
    
    // Check if campaign exists and is not sent
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    // Don't allow deleting sent campaigns
    if (existingCampaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Cannot delete sent campaigns' },
        { status: 400 }
      )
    }
    
    // Delete the campaign (cascade will handle analytics)
    const { error: deleteError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Error deleting campaign:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/campaigns/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 