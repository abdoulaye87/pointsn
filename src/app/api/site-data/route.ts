import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Return site content for a given slug (NO CACHING)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug requis' }, { status: 400 })
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, name, activity, city, slug')
    .eq('slug', slug)
    .single()

  if (clientError || !client) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  }

  const { data: siteContent } = await supabase
    .from('site_contents')
    .select('id, html_content, css_content, generated_at')
    .eq('client_id', client.id)
    .single()

  return new NextResponse(JSON.stringify({
    hasSite: !!siteContent,
    client,
    site: siteContent ? {
      html: siteContent.html_content,
      css: siteContent.css_content,
    } : null,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
