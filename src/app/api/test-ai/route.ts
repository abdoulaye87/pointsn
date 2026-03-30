import { NextResponse } from 'next/server'
import { getAI, callAI, parseAIJSON, loadAIConfig } from '@/lib/ai-service'

// GET - Test la connexion AI et retourne les détails
export async function GET() {
  const diagnostics: Record<string, string> = {}

  // 1. Check environment variables
  diagnostics['ZAI_BASE_URL'] = process.env.ZAI_BASE_URL || 'NON DÉFINIE'
  diagnostics['ZAI_API_KEY'] = process.env.ZAI_API_KEY ? `***${process.env.ZAI_API_KEY.slice(-4)}` : 'NON DÉFINIE'

  // 2. Check config loading
  try {
    const config = loadAIConfig()
    diagnostics['config_loaded'] = 'OK ✅'
    diagnostics['config_baseUrl'] = config.baseUrl
    diagnostics['config_apiKey'] = config.apiKey ? `***${config.apiKey.slice(-4)}` : 'MISSING ❌'
  } catch (error) {
    diagnostics['config_loaded'] = `ERREUR ❌: ${(error as Error).message}`
  }

  // 3. Test ZAI instance creation
  try {
    const zai = await getAI()
    diagnostics['zai_instance'] = 'OK ✅'
  } catch (error) {
    diagnostics['zai_instance'] = `ERREUR ❌: ${(error as Error).message}`
  }

  // 4. Test AI call (court)
  try {
    const startTime = Date.now()
    const result = await callAI(
      'Réponds avec juste: {"status": "ok"}',
      'Tu réponds uniquement en JSON valide.',
      1, // 1 seul essai
      100 // max_tokens très court
    )
    const elapsed = Date.now() - startTime
    diagnostics['ai_call'] = `OK ✅ (${elapsed}ms)`
    diagnostics['ai_response'] = result.substring(0, 200)
    
    // Test parsing
    try {
      const parsed = parseAIJSON(result)
      diagnostics['json_parse'] = 'OK ✅'
    } catch {
      diagnostics['json_parse'] = 'Le test ne retourne pas HTML/CSS, c\'est normal'
    }
  } catch (error) {
    const err = error as Error
    diagnostics['ai_call'] = `ERREUR ❌: ${err.message}`
    
    // Extraire le statut HTTP de l'erreur
    const statusMatch = err.message.match(/status (\d+)/)
    if (statusMatch) {
      diagnostics['http_status'] = statusMatch[1]
      
      if (statusMatch[1] === '429') {
        diagnostics['conseil'] = 'Rate limit atteint. Attendez quelques minutes avant de réessayer.'
      }
    }
    
    if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
      diagnostics['conseil'] = '❌ Le serveur IA est INACCESSIBLE depuis Vercel. ZAI_BASE_URL doit être une URL publique, pas une IP privée (172.x.x.x).'
    }
    
    if (err.message.includes('timeout') || err.message.includes('TIMEDOUT')) {
      diagnostics['conseil'] = '⏱️ Timeout. Augmentez le timeout dans vercel.json ou passez au plan Vercel Pro (60s au lieu de 10s).'
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    platform: 'vercel',
    diagnostics
  })
}
