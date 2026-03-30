/**
 * IASN Site Generation Worker
 * 
 * Ce script tourne en arrière-plan et génère automatiquement les sites
 * pour les nouveaux clients via l'IA.
 * 
 * Il interroge Supabase toutes les 60 secondes pour trouver les clients
 * qui n'ont pas encore de site_contents, génère le site avec l'IA,
 * et le sauvegarde dans Supabase.
 * 
 * Usage:
 *   bun run worker/generate-sites.ts
 * 
 * ou via cron:
 *   */1 * * * * cd /home/z/my-project/pointsn && bun run worker/generate-sites.ts >> worker/worker.log 2>&1
 */

import { createClient } from '@supabase/supabase-js'
import ZAI from 'z-ai-web-dev-sdk'

// Configuration Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables Supabase manquantes. NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY requises.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Configuration AI
const AI_BASE_URL = process.env.ZAI_BASE_URL || 'http://172.25.136.193:8080/v1'
const AI_API_KEY = process.env.ZAI_API_KEY || 'Z.ai'

const zai = new ZAI({
  baseUrl: AI_BASE_URL,
  apiKey: AI_API_KEY,
  chatId: process.env.ZAI_CHAT_ID,
  userId: process.env.ZAI_USER_ID,
  token: process.env.ZAI_TOKEN,
})

console.log('🚀 IASN Site Generation Worker démarré')
console.log(`📡 Supabase: ${SUPABASE_URL}`)
console.log(`🤖 AI: ${AI_BASE_URL}`)

/**
 * Appelle l'IA avec retry
 */
async function callAI(prompt: string, systemPrompt: string, maxRetries = 3, maxTokens = 8000): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const messages: { role: string; content: string }[] = []
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
      messages.push({ role: 'user', content: prompt })

      const completion = await zai.chat.completions.create({
        messages,
        temperature: 0.9,
        max_tokens: maxTokens,
      })

      const content = completion.choices?.[0]?.message?.content
      if (!content) throw new Error('Pas de réponse de l\'IA')
      return content
    } catch (error) {
      lastError = error as Error
      const status = (error as any)?.message?.match(/status (\d+)/)?.[1]
      console.error(`  ⚠️ Tentative ${attempt}/${maxRetries} échouée${status ? ` (HTTP ${status})` : ''}`)
      
      if (status === '429' && attempt < maxRetries) {
        console.log('  ⏳ Rate limit, attente 8s...')
        await new Promise(r => setTimeout(r, 8000))
      } else if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, attempt * 4000))
      }
    }
  }
  throw lastError
}

/**
 * Parse la réponse JSON de l'IA
 */
function parseAIJSON(content: string): { html: string; css: string } {
  let clean = content.trim()

  if (clean.includes('```json')) clean = clean.split('```json')[1]
  if (clean.includes('```')) clean = clean.split('```')[0]
  clean = clean.trim()

  try {
    const result = JSON.parse(clean)
    if (result.html && result.css) return result
  } catch {}

  const jsonMatch = clean.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const result = JSON.parse(jsonMatch[0])
      if (result.html && result.css) return result
    } catch {}
  }

  throw new Error('JSON invalide')
}

/**
 * Génère un site pour un client avec l'IA
 */
async function generateSite(client: any): Promise<{ html: string; css: string }> {
  const prompt = `Crée un site web MODERNE et PROFESSIONNEL pour:

ENTREPRISE: ${client.name}
ACTIVITÉ: ${client.activity}
VILLE: ${client.city}
ADRESSE: ${client.address}
TÉL: ${client.whatsapp}

GÉNÈRE UN SITE WEB COMPLET AVEC:

1. HERO SECTION ÉPIQUE avec gradient, animation, titre "${client.name}", slogan accrocheur, boutons CTA
2. SECTION À PROPOS avec histoire de l'entreprise et chiffres clés
3. SECTION SERVICES (4-6 services) avec cartes animées
4. SECTION TÉMOIGNAGES (3 avis) avec noms sénégalais authentiques
5. SECTION CONTACT avec adresse "${client.address}, ${client.city}", WhatsApp: ${client.whatsapp} (lien: https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')})
6. FOOTER COMPLET
7. Bouton WhatsApp flottant animé

STYLE CSS: Design LUXUEUX, animations (@keyframes), hover effects, glassmorphism, 100% responsive mobile-first

Réponds UNIQUEMENT en JSON valide:
{"html": "code html sans <html><head><body>", "css": "css complet avec animations"}`

  const systemPrompt = 'Tu es un expert en création de sites web modernes et luxueux. Tu réponds UNIQUEMENT en JSON valide avec les clés "html" et "css".'

  const content = await callAI(prompt, systemPrompt)
  return parseAIJSON(content)
}

/**
 * Traite les clients en attente
 */
async function processPendingClients() {
  try {
    // Récupérer les clients qui n'ont PAS de site_content
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, activity, city, address, whatsapp, slug, created_at')
      .order('created_at', { ascending: true })

    if (clientsError) throw clientsError
    if (!clients || clients.length === 0) {
      console.log('  ✨ Aucun client en attente')
      return
    }

    // Récupérer les IDs des clients qui ont déjà un site
    const { data: existingSites } = await supabase
      .from('site_contents')
      .select('client_id')

    const generatedClientIds = new Set(existingSites?.map(s => s.client_id) || [])

    // Filtrer les clients sans site
    const pendingClients = clients.filter(c => !generatedClientIds.has(c.id))

    if (pendingClients.length === 0) {
      console.log('  ✨ Tous les clients ont déjà un site')
      return
    }

    console.log(`📋 ${pendingClients.length} client(s) en attente de génération`)

    for (const client of pendingClients) {
      console.log(`\n🎨 Génération pour: ${client.name} (${client.activity})...`)

      try {
        const { html, css } = await generateSite(client)

        // Sauvegarder dans Supabase
        const { error: saveError } = await supabase
          .from('site_contents')
          .insert({
            client_id: client.id,
            html_content: html,
            css_content: css,
          })

        if (saveError) {
          console.error(`  ❌ Erreur sauvegarde pour ${client.name}:`, saveError.message)
        } else {
          console.log(`  ✅ Site généré pour ${client.name} → /${client.slug}`)
        }

        // Attendre entre 2 générations pour éviter le rate limit
        if (pendingClients.indexOf(client) < pendingClients.length - 1) {
          console.log('  ⏳ Attente 5s avant le prochain...')
          await new Promise(r => setTimeout(r, 5000))
        }
      } catch (error) {
        console.error(`  ❌ Échec pour ${client.name}:`, (error as Error).message)
      }
    }
  } catch (error) {
    console.error('❌ Erreur globale:', (error as Error).message)
  }
}

// Exécuter une fois
console.log('\n--- Exécution ---')
processPendingClients()
  .then(() => {
    console.log('\n✅ Terminé !')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
