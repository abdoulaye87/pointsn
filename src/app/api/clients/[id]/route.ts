import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get a specific client by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try to find by ID first (UUID format)
    let query = supabase
      .from('clients')
      .select('*')
    
    // Check if it's a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    if (isUUID) {
      query = query.eq('id', id)
    } else {
      query = query.eq('slug', id)
    }

    const { data: client, error } = await query.single()

    if (error || !client) {
      // If not found by ID and it wasn't a slug search, try by slug
      if (isUUID) {
        const { data: clientBySlug, error: slugError } = await supabase
          .from('clients')
          .select('*')
          .eq('slug', id)
          .single()

        if (slugError || !clientBySlug) {
          return NextResponse.json(
            { error: 'Client non trouvé' },
            { status: 404 }
          )
        }

        // Get payments and modifications
        const [paymentsResult, modificationsResult] = await Promise.all([
          supabase.from('payments').select('*').eq('client_id', clientBySlug.id),
          supabase.from('modifications').select('*').eq('client_id', clientBySlug.id)
        ])

        return NextResponse.json({
          ...clientBySlug,
          payments: paymentsResult.data || [],
          modifications: modificationsResult.data || []
        })
      }

      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    // Get payments and modifications
    const [paymentsResult, modificationsResult] = await Promise.all([
      supabase.from('payments').select('*').eq('client_id', client.id),
      supabase.from('modifications').select('*').eq('client_id', client.id)
    ])

    return NextResponse.json({
      ...client,
      payments: paymentsResult.data || [],
      modifications: modificationsResult.data || []
    })
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du client' },
      { status: 500 }
    )
  }
}

// PUT - Update a client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data: client, error } = await supabase
      .from('clients')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du client' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du client' },
      { status: 500 }
    )
  }
}
