import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAuth } from '@/lib/auth'

// GET - List clients (ADMIN sees all, CLIENT sees only own data)
export async function GET(request: NextRequest) {
  return withAuth(request, async (clientId?: string) => {
    if (clientId) {
      // Client : ne voit que ses propres données
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (error || !client) {
        return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
      }

      const { data: modifications } = await supabase
        .from('modifications')
        .select('*')
        .eq('client_id', clientId)

      const { data: siteContents } = await supabase
        .from('site_contents')
        .select('client_id, id, generated_at')
        .eq('client_id', clientId)

      return NextResponse.json({
        ...client,
        modifications: modifications || [],
        hasSite: (siteContents?.length || 0) > 0
      })
    }

    // Admin : voit tous les clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientsError) throw clientsError

    const { data: payments } = await supabase.from('payments').select('*')
    const { data: modifications } = await supabase.from('modifications').select('*')
    const { data: siteContents } = await supabase
      .from('site_contents')
      .select('client_id, id, generated_at')

    const clientsWithRelations = clients?.map(client => ({
      ...client,
      payments: payments?.filter(p => p.client_id === client.id) || [],
      modifications: modifications?.filter(m => m.client_id === client.id) || [],
      hasSite: siteContents?.some(s => s.client_id === client.id) || false
    }))

    return NextResponse.json(clientsWithRelations)
  })
}

// POST - Create client (public - registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, activity, city, address, whatsapp } = body

    if (!name || !activity || !city || !address || !whatsapp) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    const baseSlug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    let slug = baseSlug
    let counter = 1

    const { data: existingClient } = await supabase.from('clients').select('slug').eq('slug', slug).single()
    while (existingClient) {
      slug = `${baseSlug}-${counter}`
      const { data: checkSlug } = await supabase.from('clients').select('slug').eq('slug', slug).single()
      if (!checkSlug) break
      counter++
    }

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7)

    const { data: client, error } = await supabase
      .from('clients')
      .insert({ name, activity, city, address, whatsapp, slug, trial_ends_at: trialEndsAt.toISOString(), payment_status: 'trial' })
      .select()
      .single()

    if (error) throw error

    console.log(`✅ Client créé: ${name} (${activity})`)

    return NextResponse.json({
      ...client,
      hasSite: false,
      siteUrl: `/${slug}`,
      message: 'Site en cours de génération par IA...'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
