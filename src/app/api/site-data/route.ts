import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Retourne les données client + site pour un slug donné (pour polling)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'slug requis' }, { status: 400 })
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('slug', slug)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    // Supabase might return old cached data, force fresh read with cache bypass
    const { data: siteContent } = await supabase
      .from('site_contents')
      .select('*')
      .eq('client_id', client.id)
      .single()

    return NextResponse.json({
      client: {
        name: client.name,
        activity: client.activity,
        city: client.city,
        whatsapp: client.whatsapp,
      },
      hasSite: !!siteContent,
      site: siteContent ? {
        html: siteContent.html_content,
        css: siteContent.css_content,
      } : null,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
