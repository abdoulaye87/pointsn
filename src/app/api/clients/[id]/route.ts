import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAuth } from '@/lib/auth'

// GET - Get client by ID (CLIENT can only see own data, ADMIN sees all)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (clientId?: string) => {
    const { id } = await params

    // Client ne peut voir que ses propres données
    if (clientId && clientId !== id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    const query = isUUID
      ? supabase.from('clients').select('*').eq('id', id)
      : supabase.from('clients').select('*').eq('slug', id)

    const { data: client, error } = await query.single()

    if (error || !client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    // Client ne peut accéder qu'à son propre profil
    if (clientId && client.id !== clientId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const [paymentsResult, modificationsResult] = await Promise.all([
      supabase.from('payments').select('*').eq('client_id', client.id),
      supabase.from('modifications').select('*').eq('client_id', client.id)
    ])

    return NextResponse.json({
      ...client,
      payments: paymentsResult.data || [],
      modifications: modificationsResult.data || []
    })
  })
}

// PUT - Update client (CLIENT can only update own data, ADMIN can update all)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (clientId?: string) => {
    const { id } = await params
    const body = await request.json()

    // Client ne peut modifier que ses propres données
    if (clientId && clientId !== id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { data: client, error } = await supabase
      .from('clients')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(client)
  })
}

// DELETE - Delete client (ADMIN ONLY)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Suppression réservée à l'admin
  if (!clientId(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'iasn-admin-2024'
  return authHeader?.startsWith('Bearer ') && authHeader.slice(7) === ADMIN_SECRET
}
