import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List all modifications
export async function GET() {
  try {
    // Récupérer les modifications
    const { data: modifications, error } = await supabase
      .from('modifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Récupérer les clients associés
    const clientIds = [...new Set(modifications?.map(m => m.client_id) || [])]
    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .in('id', clientIds)

    // Combiner les données
    const modificationsWithClients = modifications?.map(modification => ({
      ...modification,
      client: clients?.find(c => c.id === modification.client_id) || null
    }))

    return NextResponse.json(modificationsWithClients)
  } catch (error) {
    console.error('Error fetching modifications:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des modifications' },
      { status: 500 }
    )
  }
}

// POST - Create a modification request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, request: modificationRequest } = body

    if (!clientId || !modificationRequest) {
      return NextResponse.json(
        { error: 'ID client et demande requis' },
        { status: 400 }
      )
    }

    const { data: modification, error } = await supabase
      .from('modifications')
      .insert({
        client_id: clientId,
        request: modificationRequest,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(modification)
  } catch (error) {
    console.error('Error creating modification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la demande' },
      { status: 500 }
    )
  }
}

// PUT - Update modification status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID et statut requis' },
        { status: 400 }
      )
    }

    const { data: modification, error } = await supabase
      .from('modifications')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(modification)
  } catch (error) {
    console.error('Error updating modification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
