import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/auth'

// GET - Admin dashboard data (ADMIN ONLY)
export async function GET(request: Request) {
  return withAdminAuth(request as any, async () => {
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientsError) throw clientsError

    const { data: payments } = await supabase.from('payments').select('*')

    const clientsWithPayments = clients?.map(client => ({
      ...client,
      payments: payments?.filter(p => p.client_id === client.id) || []
    })) || []

    const totalClients = clientsWithPayments.length
    const activeSites = clientsWithPayments.filter(
      c => c.payment_status === 'active' || c.payment_status === 'trial'
    ).length
    const estimatedRevenue = clientsWithPayments.filter(
      c => c.payment_status === 'active'
    ).length * 2000

    const now = new Date()
    const updatedClients = clientsWithPayments.map(client => ({
      ...client,
      daysRemaining: Math.max(
        0,
        Math.ceil((new Date(client.trial_ends_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      ),
    }))

    return NextResponse.json({
      clients: updatedClients,
      stats: { totalClients, activeSites, estimatedRevenue },
    })
  })
}
