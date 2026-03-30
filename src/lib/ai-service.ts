import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'
import os from 'os'

/**
 * Service AI centralisé pour IASN
 * 
 * Ce service contourne ZAI.create() qui nécessite un fichier .z-ai-config.
 * Il charge la configuration depuis :
 * 1. Les variables d'environnement (ZAI_BASE_URL, ZAI_API_KEY, etc.)
 * 2. Le fichier .z-ai-config dans la racine du projet
 * 3. Le fichier .z-ai-config dans le home directory
 * 4. Le fichier /etc/.z-ai-config
 */

interface AIConfig {
  baseUrl: string
  apiKey: string
  chatId?: string
  userId?: string
  token?: string
}

let zaiInstance: InstanceType<typeof ZAI> | null = null

/**
 * Charge la configuration AI depuis les variables d'environnement ou les fichiers
 */
function loadAIConfig(): AIConfig {
  // Priorité 1 : Variables d'environnement
  if (process.env.ZAI_BASE_URL && process.env.ZAI_API_KEY) {
    return {
      baseUrl: process.env.ZAI_BASE_URL,
      apiKey: process.env.ZAI_API_KEY,
      chatId: process.env.ZAI_CHAT_ID,
      userId: process.env.ZAI_USER_ID,
      token: process.env.ZAI_TOKEN,
    }
  }

  // Priorité 2-4 : Fichiers de config
  const configPaths = [
    path.join(process.cwd(), '.z-ai-config'),
    path.join(os.homedir(), '.z-ai-config'),
    '/etc/.z-ai-config'
  ]

  for (const filePath of configPaths) {
    try {
      const configStr = fs.readFileSync(filePath, 'utf-8')
      const config = JSON.parse(configStr)
      if (config.baseUrl && config.apiKey) {
        return config as AIConfig
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`Erreur lecture config ${filePath}:`, error)
      }
    }
  }

  throw new Error(
    'Configuration AI non trouvée.\n' +
    'Options :\n' +
    '1. Variables d\'environnement : ZAI_BASE_URL, ZAI_API_KEY\n' +
    '2. Fichier .z-ai-config dans la racine du projet\n' +
    '3. Fichier .z-ai-config dans le home directory\n' +
    '4. Fichier /etc/.z-ai-config'
  )
}

/**
 * Récupère une instance singleton de ZAI
 */
export async function getAI(): Promise<InstanceType<typeof ZAI>> {
  if (!zaiInstance) {
    const config = loadAIConfig()
    zaiInstance = new ZAI(config)
  }
  return zaiInstance
}

/**
 * Appelle l'IA avec retry automatique et backoff progressif
 */
export async function callAI(
  prompt: string,
  systemPrompt: string = 'Tu es un expert en création de sites web professionnels.',
  maxRetries: number = 3,
  maxTokens: number = 8000
): Promise<string> {
  const zai = await getAI()
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const messages: { role: string; content: string }[] = []
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt })
      }
      messages.push({ role: 'user', content: prompt })

      const completion = await zai.chat.completions.create({
        messages,
        temperature: 0.9,
        max_tokens: maxTokens,
      })

      const content = completion.choices?.[0]?.message?.content
      if (!content) {
        throw new Error('Pas de réponse de l\'IA')
      }

      return content
    } catch (error) {
      lastError = error as Error
      const status = (error as any)?.message?.match(/status (\d+)/)?.[1]
      console.error(`Tentative ${attempt}/${maxRetries} échouée${status ? ` (HTTP ${status})` : ''}:`, error)

      // Si erreur 429 (rate limit), attendre plus longtemps
      if (status === '429' && attempt < maxRetries) {
        const waitTime = attempt * 5000 // 5s, 10s, 15s
        console.log(`Rate limit détecté, attente ${waitTime / 1000}s...`)
        await new Promise(r => setTimeout(r, waitTime))
      } else if (attempt < maxRetries) {
        const waitTime = attempt * 3000 // 3s, 6s, 9s
        await new Promise(r => setTimeout(r, waitTime))
      }
    }
  }

  throw lastError || new Error('Toutes les tentatives ont échoué')
}

/**
 * Parse la réponse JSON de l'IA de façon robuste
 */
export function parseAIJSON(content: string): { html: string; css: string } {
  let clean = content.trim()

  // Enlever les blocs de code markdown
  if (clean.includes('```json')) {
    clean = clean.split('```json')[1]
  }
  if (clean.includes('```')) {
    clean = clean.split('```')[0]
  }
  clean = clean.trim()

  // Essayer de parser directement
  try {
    const result = JSON.parse(clean)
    if (result.html && result.css) return result
  } catch {
    // Continuer avec les méthodes de réparation
  }

  // Extraire l'objet JSON avec regex
  const jsonMatch = clean.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const result = JSON.parse(jsonMatch[0])
      if (result.html && result.css) return result
    } catch {
      // Essayer de réparer le JSON tronqué
      try {
        let repaired = jsonMatch[0]
        // Fermer les accolades et crochets ouverts
        const openBraces = (repaired.match(/\{/g) || []).length
        const closeBraces = (repaired.match(/\}/g) || []).length
        const openBrackets = (repaired.match(/\[/g) || []).length
        const closeBrackets = (repaired.match(/\]/g) || []).length
        
        // Fermer les strings ouvertes
        if (repaired.endsWith('"') || repaired.endsWith("'")) {
          // String probablement fermée
        } else if (repaired.endsWith(',') || repaired.endsWith(':')) {
          // Enlever le dernier caractère invalide
          repaired = repaired.slice(0, -1)
        }

        // Ajouter les fermures manquantes
        repaired += ']'.repeat(Math.max(0, openBrackets - closeBrackets))
        repaired += '"'.repeat(((repaired.match(/"/g) || []).length % 2))
        repaired += '}'.repeat(Math.max(0, openBraces - closeBraces))

        const result = JSON.parse(repaired)
        if (result.html && result.css) return result
      } catch {
        // Impossible de réparer
      }
    }
  }

  throw new Error('Impossible de parser la réponse IA en JSON valide')
}

/**
 * Génère un site complet avec l'IA
 */
export async function generateSiteWithAI(client: {
  name: string
  activity: string
  city: string
  address: string
  whatsapp: string
}): Promise<{ html: string; css: string }> {
  const prompt = `Crée un site web MODERNE et PROFESSIONNEL pour:

ENTREPRISE: ${client.name}
ACTIVITÉ: ${client.activity}
VILLE: ${client.city}
ADRESSE: ${client.address}
TÉL: ${client.whatsapp}

GÉNÈRE UN SITE WEB COMPLET AVEC:

1. HERO SECTION ÉPIQUE:
- Background avec gradient moderne
- Animation d'entrée (fade-in, slide-up)
- Titre "${client.name}" ENORME
- Slogan accrocheur pour ${client.activity}
- Boutons animés avec hover effects
- Pattern animé en arrière-plan

2. SECTION À PROPOS:
- Histoire captivante de l'entreprise
- Chiffres clés (clients, années d'expérience)
- Design moderne avec layout asymétrique

3. SECTION SERVICES (4-6 services):
- Cartes avec icônes grandes
- Hover effects impressionnants
- Descriptions professionnelles

4. SECTION TÉMOIGNAGES (3 avis):
- Noms sénégalais authentiques
- Commentaires réalistes et détaillés
- Étoiles dorées

5. SECTION CONTACT:
- Adresse: ${client.address}, ${client.city}
- WhatsApp: ${client.whatsapp} (lien: https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')})
- Formulaire de contact stylisé
- Horaires d'ouverture

6. FOOTER COMPLET

STYLE CSS REQUIS:
- Design MODERNE et LUXUEUX
- Animations CSS (@keyframes fadeIn, slideUp, bounce, pulse)
- Hover effects sur TOUS les éléments interactifs
- Box-shadows premium
- Gradients et glassmorphism
- Typographie hiérarchisée
- 100% responsive mobile-first
- Bouton WhatsApp flottant animé
- Scroll indicator animé

Réponds UNIQUEMENT en JSON valide:
{"html": "code html sans <html><head><body>", "css": "css complet avec animations"}`

  const systemPrompt = 'Tu es un expert en création de sites web modernes et luxueux. Tu crées des designs époustouflants avec des animations CSS avancées. Tu réponds UNIQUEMENT en JSON valide avec les clés "html" et "css".'

  const content = await callAI(prompt, systemPrompt)
  return parseAIJSON(content)
}

/**
 * Améliore un site existant avec l'IA
 */
export async function enhanceSiteWithAI(client: {
  name: string
  activity: string
  city: string
  address: string
  whatsapp: string
}): Promise<{ html: string; css: string }> {
  const prompt = `Tu es un expert en création de sites web LUXUEUX et PROFESSIONNELS. Crée un site web EXCEPTIONNEL pour:

**ENTREPRISE:** ${client.name}
**ACTIVITÉ:** ${client.activity}
**VILLE:** ${client.city}
**ADRESSE:** ${client.address}
**TÉLÉPHONE:** ${client.whatsapp}

CRÉE UN SITE UNIQUE ET PROFESSIONNEL AVEC:

=== HERO SECTION (ÉPIQUE) ===
- Gradient overlay sur image
- Animation de texte qui apparaît progressivement
- Titre ${client.name} ENORME et stylisé
- Slogan percutant et unique
- 2 boutons CTA animés
- Scroll indicator animé

=== SECTION À PROPOS ===
- Layout moderne (image + texte)
- Histoire captivante
- Chiffres clés animés
- Bouton "En savoir plus"

=== NOS SERVICES (6 services) ===
- Cartes avec icônes grandes
- Hover effects impressionnants
- Titres et descriptions professionnelles

=== TÉMOIGNAGES (3 clients) ===
- Noms sénégalais (Awa, Modou, Fatou...)
- Commentaires authentiques
- Étoiles dorées

=== GALERIE (6 images) ===
- Grille moderne
- Hover zoom

=== SECTION CONTACT ===
- Formulaire stylisé
- Google Maps placeholder
- Infos de contact avec icônes
- WhatsApp: https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}

=== FOOTER COMPLET ===

**CSS AVANCÉ:**
- Keyframe animations
- Hover effects partout
- Smooth scroll
- Gradients élégants
- 100% responsive

Réponds UNIQUEMENT en JSON valide:
{
  "html": "code html complet",
  "css": "css complet avec animations"
}`

  const systemPrompt = 'Tu es un designer web expert premium. Tu crées des sites exceptionnels avec animations CSS avancées. Tu réponds uniquement en JSON valide avec les clés "html" et "css".'

  const content = await callAI(prompt, systemPrompt)
  return parseAIJSON(content)
}
