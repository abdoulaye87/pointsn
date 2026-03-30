import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateSiteWithAI } from '@/lib/ai-service'

// POST - Générer un site avec l'IA
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId } = body

    if (!clientId) {
      return NextResponse.json({ error: 'ID client requis' }, { status: 400 })
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    console.log(`🎨 Génération site IA pour ${client.name}...`)

    const { html, css } = await generateSiteWithAI({
      name: client.name,
      activity: client.activity,
      city: client.city,
      address: client.address,
      whatsapp: client.whatsapp,
    })

    const { error } = await supabase
      .from('site_contents')
      .upsert({
        client_id: clientId,
        html_content: html,
        css_content: css,
        generated_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      siteUrl: `/${client.slug}` 
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET - Régénérer un site
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ error: 'ID client requis' }, { status: 400 })
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    console.log(`🎨 Régénération site IA pour ${client.name}...`)

    const { html, css } = await generateSiteWithAI({
      name: client.name,
      activity: client.activity,
      city: client.city,
      address: client.address,
      whatsapp: client.whatsapp,
    })

    const { error } = await supabase
      .from('site_contents')
      .upsert({
        client_id: clientId,
        html_content: html,
        css_content: css,
        generated_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      siteUrl: `/${client.slug}` 
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
