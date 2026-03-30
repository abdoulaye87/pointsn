import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAuth, withAdminAuth } from '@/lib/auth'

// GET - List modifications (ADMIN sees all, CLIENT sees only own modifications)
export async function GET(request: NextRequest) {
  return withAuth(request, async (clientId?: string) => {
    if (clientId) {
      const { data: modifications, error } = await supabase
        .from('modifications')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json(modifications)
    }

    // Admin
    const { data: modifications, error } = await supabase
      .from('modifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const clientIds = [...new Set(modifications?.map(m => m.client_id) || [])]
    const { data: clients } = await supabase.from('clients').select('*').in('id', clientIds)

    const modificationsWithClients = modifications?.map(modification => ({
      ...modification,
      client: clients?.find(c => c.id === modification.client_id) || null
    }))

    return NextResponse.json(modificationsWithClients)
  })
}

// POST - Create modification request (CLIENT creates for themselves)
export async function POST(request: NextRequest) {
  const clientId = request.headers.get('x-client-id')
  if (!clientId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { clientId: bodyClientId, request: modificationRequest } = body

    if (!modificationRequest) {
      return NextResponse.json({ error: 'Demande requise' }, { status: 400 })
    }

    // Le client ne peut créer une demande que pour lui-même
    if (bodyClientId && bodyClientId !== clientId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
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

    if (error) throw error

    return NextResponse.json(modification)
  } catch (error) {
    console.error('Error creating modification:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Update modification status (ADMIN ONLY)
export async function PUT(request: NextRequest) {
  return withAdminAuth(request, async () => {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'ID et statut requis' }, { status: 400 })
    }

    const { data: modification, error } = await supabase
      .from('modifications')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(modification)
  })
}
