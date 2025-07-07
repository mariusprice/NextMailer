import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: emailLists, error } = await supabase
      .from('email_lists')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching email lists:', error)
      return NextResponse.json(
        { error: 'Failed to fetch email lists' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ emailLists })
  } catch (error) {
    console.error('Error in GET /api/lists:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 