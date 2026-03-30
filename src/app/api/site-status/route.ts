import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Poll for pending site status (used by client browser)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ error: 'clientId requis' }, { status: 400 })
    }

    const { data: siteContent } = await supabase
      .from('site_contents')
      .select('id, generated_at')
      .eq('client_id', clientId)
      .single()

    return NextResponse.json({
      ready: !!siteContent,
      generatedAt: siteContent?.generated_at || null
    })
  } catch (error) {
    return NextResponse.json({ ready: false }, { status: 200 })
  }
}
