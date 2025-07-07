import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: listId } = params
    
    if (!listId) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = createServerClient()
    
    // Verify the email list exists
    const { data: emailList, error: listError } = await supabase
      .from('email_lists')
      .select('id, name')
      .eq('id', listId)
      .single()
    
    if (listError || !emailList) {
      return NextResponse.json(
        { error: 'Email list not found' },
        { status: 404 }
      )
    }
    
    // Get subscribers for the list
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email_list_id', listId)
      .order('created_at', { ascending: false })
    
    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError)
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }
    
    // Get counts by status
    const statusCounts = subscribers.reduce((acc, subscriber) => {
      acc[subscriber.status] = (acc[subscriber.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return NextResponse.json({
      emailList,
      subscribers,
      stats: {
        total: subscribers.length,
        active: statusCounts.active || 0,
        unsubscribed: statusCounts.unsubscribed || 0,
        bounced: statusCounts.bounced || 0,
      }
    })
  } catch (error) {
    console.error('Error in GET /api/lists/[id]/subscribers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 