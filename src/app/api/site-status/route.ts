import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Vérifier si le site d'un client est généré
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ error: 'ID client requis' }, { status: 400 })
    }

    const { data: siteContent, error } = await supabase
      .from('site_contents')
      .select('id, generated_at')
      .eq('client_id', clientId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      hasSite: !!siteContent,
      generatedAt: siteContent?.generated_at || null
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}
