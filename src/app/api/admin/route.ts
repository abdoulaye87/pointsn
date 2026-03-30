import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get admin dashboard data
export async function GET() {
  try {
    // Récupérer les clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientsError) {
      throw clientsError
    }

    // Récupérer les paiements
    const { data: payments } = await supabase
      .from('payments')
      .select('*')

    // Combiner les données
    const clientsWithPayments = clients?.map(client => ({
      ...client,
      payments: payments?.filter(p => p.client_id === client.id) || []
    })) || []

    // Calculate statistics
    const totalClients = clientsWithPayments.length
    const activeSites = clientsWithPayments.filter(
      c => c.payment_status === 'active' || c.payment_status === 'trial'
    ).length

    // Calculate estimated revenue (active clients * 2000 FCFA)
    const estimatedRevenue = clientsWithPayments.filter(
      c => c.payment_status === 'active'
    ).length * 2000

    // Update payment statuses based on trial end dates
    const now = new Date()
    const updatedClients = clientsWithPayments.map(client => {
      const isTrialEnded = new Date(client.trial_ends_at) < now
      const needsUpdate = isTrialEnded && client.payment_status === 'trial'

      return {
        ...client,
        daysRemaining: Math.max(
          0,
          Math.ceil((new Date(client.trial_ends_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        ),
        needsStatusUpdate: needsUpdate,
      }
    })

    return NextResponse.json({
      clients: updatedClients,
      stats: {
        totalClients,
        activeSites,
        estimatedRevenue,
      },
    })
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}
