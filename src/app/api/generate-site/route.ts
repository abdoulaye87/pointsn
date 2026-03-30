import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - Marquer un site pour régénération (le worker le traitera)
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

    // Supprimer l'ancien site_content pour que le worker le régénère
    const { error: deleteError } = await supabase
      .from('site_contents')
      .delete()
      .eq('client_id', clientId)

    return NextResponse.json({
      success: true,
      message: 'Site marqué pour régénération par IA',
      siteUrl: `/${client.slug}`
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET - Marquer un site pour régénération
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

    await supabase.from('site_contents').delete().eq('client_id', clientId)

    return NextResponse.json({
      success: true,
      message: 'Site marqué pour régénération par IA',
      siteUrl: `/${client.slug}`
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
