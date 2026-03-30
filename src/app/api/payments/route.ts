import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List all payments
export async function GET() {
  try {
    // Récupérer les paiements
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Récupérer les clients associés
    const clientIds = [...new Set(payments?.map(p => p.client_id) || [])]
    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .in('id', clientIds)

    // Combiner les données
    const paymentsWithClients = payments?.map(payment => ({
      ...payment,
      client: clients?.find(c => c.id === payment.client_id) || null
    }))

    return NextResponse.json(paymentsWithClients)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paiements' },
      { status: 500 }
    )
  }
}

// POST - Create a payment or update payment status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, action } = body

    if (!clientId) {
      return NextResponse.json(
        { error: 'ID client requis' },
        { status: 400 }
      )
    }

    if (action === 'validate') {
      // Validate payment - set status to active
      const { data: client, error: updateError } = await supabase
        .from('clients')
        .update({ payment_status: 'active' })
        .eq('id', clientId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Create a payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          client_id: clientId,
          amount: 2000,
          status: 'active'
        })

      if (paymentError) {
        throw paymentError
      }

      return NextResponse.json({ success: true, client })
    }

    if (action === 'late') {
      // Mark as late
      const { data: client, error } = await supabase
        .from('clients')
        .update({ payment_status: 'late' })
        .eq('id', clientId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({ success: true, client })
    }

    return NextResponse.json(
      { error: 'Action non reconnue' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du paiement' },
      { status: 500 }
    )
  }
}
