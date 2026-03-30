import { createClient } from '@supabase/supabase-js'
import ZAI from 'z-ai-web-dev-sdk'

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '5')  // 5 sites en parallèle
const MAX_CLIENTS = parseInt(process.env.MAX_CLIENTS || '50') // 50 clients max par run
const RATE_LIMIT_DELAY = 2000  // 2s entre chaque appel IA

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

// ──────────────────────────────────────────────
// Appel IA avec retry et rate limiting
// ──────────────────────────────────────────────
async function callAI(prompt: string, systemPrompt: string, maxRetries = 3): Promise<string> {
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const messages: { role: string; content: string }[] = []
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
      messages.push({ role: 'user', content: prompt })
      
      const completion = await zai.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 4000,  // Réduit de 16000 → 4000 (4x plus rapide)
      })
      
      const content = completion.choices?.[0]?.message?.content
      if (!content) throw new Error('Pas de reponse')
      return content
    } catch (error: any) {
      lastError = error as Error
      const isRateLimit = error?.message?.includes('429') || error?.status === 429
      
      if (isRateLimit) {
        // Attendre plus longtemps si rate limited
        const waitTime = Math.min(attempt * 10000, 30000) // 10s, 20s, 30s max
        console.error(`  Rate limit (429) - attente ${waitTime / 1000}s...`)
        await new Promise(r => setTimeout(r, waitTime))
      } else if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, attempt * 3000))
      }
    }
  }
  throw lastError
}

// ──────────────────────────────────────────────
// Parsing JSON robuste
// ──────────────────────────────────────────────
function parseAIJSON(content: string): { html: string; css: string } {
  let clean = content.trim()
  if (clean.includes('```json')) clean = clean.split('```json')[1]
  if (clean.includes('```')) clean = clean.split('```')[0]
  clean = clean.trim()

  // Essayer JSON direct
  try { const r = JSON.parse(clean); if (r.html && r.css) return r } catch {}

  // Extraire avec regex
  const match = clean.match(/\{"html"\s*:\s*"[\s\S]*?"css"\s*:\s*"[\s\S]*?\}/)
  if (match) {
    try { const r = JSON.parse(match[0]); if (r.html && r.css) return r } catch {}
  }

  // Réparer JSON tronqué
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start !== -1 && end > start) {
    let candidate = clean.substring(start, end + 1)
    try { const r = JSON.parse(candidate); if (r.html && r.css) return r } catch {}
    candidate = candidate.replace(/,\s*}/g, '}')
    try { const r = JSON.parse(candidate); if (r.html && r.css) return r } catch {}
  }

  // Extraction manuelle
  const htmlStart = clean.indexOf('"html"')
  const cssStart = clean.indexOf('"css"')
  if (htmlStart !== -1 && cssStart !== -1) {
    const htmlValueStart = clean.indexOf('"', clean.indexOf(':', htmlStart)) + 1
    const cssValueStart = clean.indexOf('"', clean.indexOf(':', cssStart)) + 1
    const htmlValue = clean.substring(htmlValueStart, cssStart - 1).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t').trim()
    let cssValue = clean.substring(cssValueStart).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t')
    const openBraces = (cssValue.match(/\{/g) || []).length
    const closeBraces = (cssValue.match(/\}/g) || []).length
    cssValue += '}'.repeat(Math.max(0, openBraces - closeBraces))
    cssValue = cssValue.replace(/"\s*$/, '').trim()
    if (htmlValue.length > 50 && cssValue.length > 20) {
      return { html: htmlValue, css: cssValue }
    }
  }

  throw new Error('JSON invalide: ' + clean.substring(0, 300))
}

// ──────────────────────────────────────────────
// Génération d'un site (prompt optimisé)
// ──────────────────────────────────────────────
async function generateSite(client: any): Promise<{ html: string; css: string }> {
  const phone = client.whatsapp.replace(/[^0-9]/g, '')
  const prompt = `Site web pour: ${client.name}, ${client.activity} à ${client.city}.
Sections: Hero, Services (3), Contact (WhatsApp: wa.me/${phone}), Footer. Bouton WhatsApp flottant.
Style moderne, responsive mobile-first. Classes CSS courtes (a,b,c...).
Réponds UNIQUEMENT en JSON: {"html":"...","css":"..."}`

  const systemPrompt = `Expert web. JSON valide avec "html" et "css". HTML sans DOCTYPE/head. Compact. Pas de texte avant/après JSON.`
  const content = await callAI(prompt, systemPrompt)
  return parseAIJSON(content)
}

// ──────────────────────────────────────────────
// Traitement PARALLÈLE avec contrôle de concurrence
// ──────────────────────────────────────────────
async function processWithConcurrency(clients: any[]): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0
  let index = 0

  // Créer un pool de workers parallèles
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (index < clients.length) {
      const currentIndex = index++
      const client = clients[currentIndex]
      if (!client) break

      const startTime = Date.now()
      console.log(`[${currentIndex + 1}/${clients.length}] Generation: ${client.name} (${client.activity})...`)

      try {
        // Petit délai entre les appels pour éviter le rate limiting
        if (currentIndex > 0) {
          await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY))
        }

        const { html, css } = await generateSite(client)
        
        const { error } = await supabase
          .from('site_contents')
          .insert({ client_id: client.id, html_content: html, css_content: css })

        if (error) {
          // Vérifier si c'est un doublon (déjà généré par un autre run)
          if (error.message.includes('duplicate key') || error.message.includes('unique')) {
            console.log(`  Déjà généré (doublon): ${client.name}`)
            // Ne pas compter comme échec
          } else {
            console.error(`  Erreur sauvegarde: ${error.message}`)
            failed++
          }
        } else {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
          console.log(`  OK: ${client.name} -> /${client.slug} (${elapsed}s)`)
          success++
        }
      } catch (error: any) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
        console.error(`  ECHEC: ${client.name} - ${error.message} (${elapsed}s)`)
        failed++
      }
    }
  })

  await Promise.all(workers)
  return { success, failed }
}

// ──────────────────────────────────────────────
// Point d'entrée principal
// ──────────────────────────────────────────────
async function processPendingClients() {
  const startTime = Date.now()

  // 1. Récupérer tous les clients sans site
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, activity, city, address, whatsapp, slug')
    .order('created_at', { ascending: false })

  if (!clients?.length) {
    console.log('Aucun client dans la base')
    return
  }

  // 2. Récupérer les sites déjà générés
  const { data: existingSites } = await supabase.from('site_contents').select('client_id')
  const generatedIds = new Set(existingSites?.map(s => s.client_id) || [])
  const pending = clients.filter(c => !generatedIds.has(c.id))

  if (pending.length === 0) {
    console.log('Tous les clients ont un site')
    return
  }

  const toProcess = pending.slice(0, MAX_CLIENTS)
  console.log(`=== Worker IASN ===`)
  console.log(`${pending.length} client(s) en attente, traitement de ${toProcess.length} (concurrence: ${CONCURRENCY})`)
  console.log(`Heure de début: ${new Date().toISOString()}`)

  // 3. Traiter en parallèle
  const { success, failed } = await processWithConcurrency(toProcess)

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n=== Résultat ===`)
  console.log(`Succès: ${success}, Échecs: ${failed}`)
  console.log(`Temps total: ${totalTime}s`)
  console.log(`Temps moyen par site: ${(parseFloat(totalTime) / Math.max(success + failed, 1)).toFixed(1)}s`)
  if (pending.length > MAX_CLIENTS) {
    console.log(`${pending.length - MAX_CLIENTS} client(s) restant(s) pour le prochain run`)
  }
}

// Lancement
processPendingClients()
  .then(() => process.exit(0))
  .catch(e => { console.error('Erreur fatale:', e); process.exit(1) })
