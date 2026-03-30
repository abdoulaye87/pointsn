/**
 * IASN Site Watcher - Surveille en continu et génère les sites immédiatement
 * 
 * Ce script tourne en arrière-plan et vérifie toutes les 10 secondes
 * si de nouveaux clients sont en attente de site.
 * Dès qu'un nouveau client est détecté, il génère le site avec l'IA.
 * 
 * Le cron standard tourne toutes les 5 minutes pour les cas oubliés.
 * Ce watcher garantit que les nouveaux sites sont générés en ~30 secondes.
 */

import { createClient } from '@supabase/supabase-js'
import ZAI from 'z-ai-web-dev-sdk'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Variables Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const zai = new ZAI({
  baseUrl: process.env.ZAI_BASE_URL || 'http://172.25.136.193:8080/v1',
  apiKey: process.env.ZAI_API_KEY || 'Z.ai',
  chatId: process.env.ZAI_CHAT_ID,
  userId: process.env.ZAI_USER_ID,
  token: process.env.ZAI_TOKEN,
})

const POLL_INTERVAL = 10000 // 10 secondes
const RETRY_DELAY = 5000
const MAX_RETRIES = 2

async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const messages: { role: string; content: string }[] = []
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
      messages.push({ role: 'user', content: prompt })
      const completion = await zai.chat.completions.create({ messages, temperature: 0.9, max_tokens: 8000 })
      const content = completion.choices?.[0]?.message?.content
      if (!content) throw new Error('Pas de reponse')
      return content
    } catch (error) {
      lastError = error as Error
      if (attempt < MAX_RETRIES) await new Promise(r => setTimeout(r, attempt * RETRY_DELAY))
    }
  }
  throw lastError
}

function parseAIJSON(content: string): { html: string; css: string } {
  let clean = content.trim()
  if (clean.includes('```json')) clean = clean.split('```json')[1]
  if (clean.includes('```')) clean = clean.split('```')[0]
  clean = clean.trim()
  try { const r = JSON.parse(clean); if (r.html && r.css) return r } catch {}
  const start = clean.indexOf('{'), end = clean.lastIndexOf('}')
  if (start !== -1 && end > start) {
    let candidate = clean.substring(start, end + 1)
    try { const r = JSON.parse(candidate); if (r.html && r.css) return r } catch {}
  }
  throw new Error('JSON invalide')
}

async function generateSite(client: any): Promise<{ html: string; css: string }> {
  const prompt = `Crée un site web MODERNE pour:
ENTREPRISE: ${client.name}
ACTIVITE: ${client.activity}
VILLE: ${client.city}
ADRESSE: ${client.address}
TEL: ${client.whatsapp}
Sections: Hero, A propos, Services (4-6), Temoignages (3), Contact (WhatsApp: https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}), Footer, Bouton WhatsApp flottant.
STYLE: LUXUEUX, animations CSS, hover effects, 100% responsive.
JSON: {"html": "...", "css": "..."}`

  const systemPrompt = 'Tu es un expert en creation de sites web modernes. Reponds UNIQUEMENT en JSON valide avec "html" et "css".'
  const content = await callAI(prompt, systemPrompt)
  return parseAIJSON(content)
}

let processedIds = new Set<string>()

async function loadProcessedIds() {
  const { data: existingSites } = await supabase.from('site_contents').select('client_id')
  processedIds = new Set(existingSites?.map(s => s.client_id) || [])
}

async function checkAndGenerate() {
  try {
    // Trouver les clients les plus récents sans site
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name, activity, city, address, whatsapp, slug, created_at')
      .order('created_at', { ascending: false })

    if (!clients?.length) return

    // Mettre à jour les IDs traités
    await loadProcessedIds()

    // Trouver les clients en attente (les plus récents d'abord)
    const pending = clients.filter(c => !processedIds.has(c.id))

    if (pending.length === 0) return

    // Traiter le client le plus récent
    const client = pending[0]
    console.log(`[${new Date().toLocaleTimeString()}] 🎨 ${client.name} (${client.activity})...`)

    try {
      const { html, css } = await generateSite(client)
      const { error } = await supabase.from('site_contents').insert({
        client_id: client.id,
        html_content: html,
        css_content: css,
      })

      if (error) {
        console.error(`[${new Date().toLocaleTimeString()}] ❌ Sauvegarde échouée: ${error.message}`)
      } else {
        processedIds.add(client.id)
        console.log(`[${new Date().toLocaleTimeString()}] ✅ /${client.slug} (${html.length + css.length} chars)`)
      }
    } catch (error) {
      console.error(`[${new Date().toLocaleTimeString()}] ❌ ${client.name}:`, (error as Error).message)
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Erreur check:`, (error as Error).message)
  }
}

// Démarrage
console.log(`\n🔄 IASN Watcher démarré - vérification toutes les ${POLL_INTERVAL / 1000}s`)
console.log('Appuyez Ctrl+C pour arrêter\n')

await loadProcessedIds()

// Boucle continue
setInterval(checkAndGenerate, POLL_INTERVAL)

// Première vérification immédiate
await checkAndGenerate()

// Garder le process en vie
setInterval(() => {}, 60000)
