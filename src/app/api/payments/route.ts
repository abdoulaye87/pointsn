import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAdminAuth, withAuth } from '@/lib/auth'

// GET - List payments (ADMIN sees all, CLIENT sees only own payments)
export async function GET(request: NextRequest) {
  return withAuth(request, async (clientId?: string) => {
    if (clientId) {
      // Client : ne voit que ses paiements
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json(payments)
    }

    // Admin : voit tous les paiements
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const clientIds = [...new Set(payments?.map(p => p.client_id) || [])]
    const { data: clients } = await supabase.from('clients').select('*').in('id', clientIds)

    const paymentsWithClients = payments?.map(payment => ({
      ...payment,
      client: clients?.find(c => c.id === payment.client_id) || null
    }))

    return NextResponse.json(paymentsWithClients)
  })
}

// POST - Create/update payment (ADMIN ONLY - validate payments)
export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    const body = await request.json()
    const { clientId, action } = body

    if (!clientId) {
      return NextResponse.json({ error: 'ID client requis' }, { status: 400 })
    }

    if (action === 'validate') {
      const { data: client, error: updateError } = await supabase
        .from('clients')
        .update({ payment_status: 'active' })
        .eq('id', clientId)
        .select()
        .single()

      if (updateError) throw updateError

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({ client_id: clientId, amount: 2000, status: 'active' })

      if (paymentError) throw paymentError

      return NextResponse.json({ success: true, client })
    }

    if (action === 'late') {
      const { data: client, error } = await supabase
        .from('clients')
        .update({ payment_status: 'late' })
        .eq('id', clientId)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, client })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  })
}
