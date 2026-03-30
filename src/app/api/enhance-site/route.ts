import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Diagnostic endpoint
export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NON DEFINIE',
    supabaseKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    timestamp: new Date().toISOString()
  })
}

// POST - Demander une amélioration (le worker la traitera)
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
