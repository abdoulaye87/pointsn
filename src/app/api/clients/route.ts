import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List all clients
export async function GET() {
  try {
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
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Create client (site generation is handled by the worker)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, activity, city, address, whatsapp } = body

    if (!name || !activity || !city || !address || !whatsapp) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    // Generate unique slug
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

    // Create client
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7)

    const { data: client, error } = await supabase
      .from('clients')
      .insert({ name, activity, city, address, whatsapp, slug, trial_ends_at: trialEndsAt.toISOString(), payment_status: 'trial' })
      .select()
      .single()

    if (error) throw error

    console.log(`✅ Client créé: ${name} (${activity}) - Le site sera généré automatiquement`)

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
