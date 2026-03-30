import { NextResponse } from 'next/server'

// GET - Retourne les infos de diagnostic (sans clés sensibles)
export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NON DEFINIE',
    supabaseKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    aiBaseUrl: process.env.ZAI_BASE_URL || 'NON DEFINIE',
    aiKeySet: !!process.env.ZAI_API_KEY,
    timestamp: new Date().toISOString()
  })
}
