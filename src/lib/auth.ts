import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware d'authentification IASN
 * 
 * Deux niveaux d'accès :
 * 1. ADMIN : via header Authorization: Bearer <ADMIN_SECRET>
 * 2. CLIENT : via header X-Client-Id (l'ID du client stocké dans localStorage)
 * 
 * Usage dans les routes :
 *   import { withAdminAuth, withClientAuth } from '@/lib/auth'
 * 
 *   // Admin only
 *   export async function GET(req) { return withAdminAuth(req, async () => { ... }) }
 *   
 *   // Client accède à ses propres données
 *   export async function GET(req) { return withClientAuth(req, async (clientId) => { ... }) }
 */

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'iasn-admin-2024'

/**
 * Vérifie le token admin (Bearer token dans header Authorization)
 */
export function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  return authHeader.slice(7) === ADMIN_SECRET
}

/**
 * Récupère le client ID depuis le header X-Client-Id
 */
export function getClientId(request: NextRequest): string | null {
  return request.headers.get('x-client-id')
}

/**
 * Wrapper pour les endpoints admin uniquement
 */
export async function withAdminAuth(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  try {
    return await handler()
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * Wrapper pour les endpoints client (le client accède à ses propres données)
 */
export async function withClientAuth(
  request: NextRequest,
  handler: (clientId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const clientId = getClientId(request)
  if (!clientId) {
    return NextResponse.json({ error: 'ID client requis' }, { status: 401 })
  }
  try {
    return await handler(clientId)
  } catch (error) {
    console.error('Client API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * Wrapper pour les endpoints accessibles par admin OU par le client lui-même
 */
export async function withAuth(
  request: NextRequest,
  handler: (clientId?: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const clientId = getClientId(request)
  
  // Si c'est un admin, il peut tout faire
  if (isAdmin(request)) {
    try {
      return await handler()
    } catch (error) {
      console.error('API error:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
  }
  
  // Si c'est un client, vérifier son ID
  if (!clientId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  try {
    return await handler(clientId)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
