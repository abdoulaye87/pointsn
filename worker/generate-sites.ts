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

async function callAI(prompt: string, systemPrompt: string, maxRetries = 2): Promise<string> {
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
      console.error(`  Tentative ${attempt}/${maxRetries} echouee`)
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, attempt * 5000))
    }
  }
  throw lastError
}

function parseAIJSON(content: string): { html: string; css: string } {
  let clean = content.trim()
  if (clean.includes('```json')) clean = clean.split('```json')[1]
  if (clean.includes('```')) clean = clean.split('```')[0]
  clean = clean.trim()

  // Essayer JSON direct
  try { const r = JSON.parse(clean); if (r.html && r.css) return r } catch {}

  // Extraire avec regex - le plus grand objet JSON possible
  const match = clean.match(/\{"html"\s*:\s*"[\s\S]*?"css"\s*:\s*"[\s\S]*?\}/)
  if (match) {
    try { const r = JSON.parse(match[0]); if (r.html && r.css) return r } catch {}
  }

  // Essayer de réparer un JSON tronqué
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start !== -1 && end > start) {
    let candidate = clean.substring(start, end + 1)
    try { const r = JSON.parse(candidate); if (r.html && r.css) return r } catch {}
    // Réparer : fermer les strings et accolades
    candidate = candidate.replace(/,\s*}/g, '}')
    try { const r = JSON.parse(candidate); if (r.html && r.css) return r } catch {}
  }

  // Extraire html et css manuellement si possible
  const htmlMatch = clean.match(/"html"\s*:\s*"((?:[^"\\]|\\.)*)"/s)
  const cssMatch = clean.match(/"css"\s*:\s*"((?:[^"\\]|\\.)*)"/s)
  if (htmlMatch && cssMatch) {
    return { html: htmlMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'), css: cssMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') }
  }

  throw new Error('JSON invalide: ' + clean.substring(0, 200))
}

async function generateSite(client: any): Promise<{ html: string; css: string }> {
  const prompt = `Crée un site web MODERNE et PROFESSIONNEL pour:
ENTREPRISE: ${client.name}
ACTIVITE: ${client.activity}
VILLE: ${client.city}
ADRESSE: ${client.address}
TEL: ${client.whatsapp}
GÉNÈRE UN SITE COMPLET AVEC: Hero, A propos, Services (4-6), Témoignages (3), Contact (WhatsApp: https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}), Footer, Bouton WhatsApp flottant.
STYLE: LUXUEUX, animations CSS, hover effects, 100% responsive mobile-first.
Réponds UNIQUEMENT en JSON: {"html": "...", "css": "..."}`

  const systemPrompt = 'Tu es un expert en creation de sites web modernes. Reponds UNIQUEMENT en JSON valide avec "html" et "css".'
  const content = await callAI(prompt, systemPrompt)
  return parseAIJSON(content)
}

async function processPendingClients() {
  const { data: clients } = await supabase.from('clients').select('id, name, activity, city, address, whatsapp, slug').order('created_at', { ascending: true })
  if (!clients?.length) { console.log('Aucun client'); return }

  const { data: existingSites } = await supabase.from('site_contents').select('client_id')
  const generatedIds = new Set(existingSites?.map(s => s.client_id) || [])
  const pending = clients.filter(c => !generatedIds.has(c.id))

  if (pending.length === 0) { console.log('Tous les clients ont un site'); return }

  console.log(`${pending.length} client(s) en attente`)

  const maxClients = parseInt(process.env.MAX_CLIENTS || '1')
  const toProcess = pending.slice(0, maxClients)

  for (const client of toProcess) {
    console.log(`\nGeneration pour: ${client.name} (${client.activity})...`)
    try {
      const { html, css } = await generateSite(client)
      const { error } = await supabase.from('site_contents').insert({ client_id: client.id, html_content: html, css_content: css })
      if (error) { console.error(`Erreur sauvegarde: ${error.message}`) } else { console.log(`OK: ${client.name} -> /${client.slug}`) }
    } catch (error) { console.error(`Echec ${client.name}:`, (error as Error).message) }
    if (toProcess.indexOf(client) < toProcess.length - 1) await new Promise(r => setTimeout(r, 5000))
  }
}

console.log('--- Worker IASN ---')
processPendingClients().then(() => process.exit(0)).catch(e => { console.error('Erreur:', e); process.exit(1) })
