import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Test de connexion et liste des tables
export async function GET() {
  try {
    // Tester la connexion en listant les tables disponibles
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1)

    // Si l'erreur est "table not found", c'est normal - la connexion fonctionne
    if (error && !error.message.includes('does not exist')) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        hint: 'Vérifiez que votre table existe et que RLS est configuré'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Connexion Supabase réussie!',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    })
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

// POST - Exemple d'insertion
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { table, data } = body

    if (!table || !data) {
      return NextResponse.json({ 
        error: 'Table et data sont requis' 
      }, { status: 400 })
    }

    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Erreur inconnue' 
    }, { status: 500 })
  }
}
