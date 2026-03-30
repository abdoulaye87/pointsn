import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { supabase } from '@/lib/supabase'

// Générer une image professionnelle
async function generateImage(prompt: string): Promise<string | null> {
  try {
    const zai = await ZAI.create()
    
    const response = await zai.images.generations.create({
      prompt,
      size: '1344x768'
    })

    return response.data[0]?.base64 || null
  } catch (error) {
    console.error('Erreur génération image:', error)
    return null
  }
}

// POST - Améliorer un site avec l'IA
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId } = body

    if (!clientId) {
      return NextResponse.json({ error: 'ID client requis' }, { status: 400 })
    }

    // Récupérer le client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    console.log(`🎨 Amélioration IA du site pour ${client.name}...`)

    const zai = await ZAI.create()

    // Couleurs par activité
    const colorSchemes: Record<string, { primary: string; secondary: string; accent: string }> = {
      restaurant: { primary: '#d97706', secondary: '#fbbf24', accent: '#7c2d12' },
      coiffure: { primary: '#ec4899', secondary: '#f472b6', accent: '#831843' },
      boutique: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#4c1d95' },
      immobilier: { primary: '#0891b2', secondary: '#22d3ee', accent: '#164e63' },
      default: { primary: '#059669', secondary: '#34d399', accent: '#064e3b' }
    }

    const colors = colorSchemes[client.activity.toLowerCase()] || colorSchemes.default

    // Générer une image hero
    const imagePrompts: Record<string, string> = {
      restaurant: `Professional food photography, gourmet African cuisine, elegant restaurant dish presentation, warm lighting, 4k`,
      coiffure: `Luxury hair salon interior, professional styling area, modern elegant design, soft lighting, 4k`,
      boutique: `High-end fashion boutique, stylish clothing racks, modern retail design, ambient lighting, 4k`,
      immobilier: `Beautiful modern villa, luxury real estate, professional architecture photography, 4k`,
      default: `Professional business environment, modern office, elegant design, warm lighting, 4k`
    }

    const heroImage = await generateImage(
      imagePrompts[client.activity.toLowerCase()] || imagePrompts.default
    )

    const prompt = `Tu es un expert en création de sites web LUXUEUX et PROFESSIONNELS. Crée un site web EXCEPTIONNEL pour:

**ENTREPRISE:** ${client.name}
**ACTIVITÉ:** ${client.activity}
**VILLE:** ${client.city}
**ADRESSE:** ${client.address}
**TÉLÉPHONE:** ${client.whatsapp}
**COULEURS THEME:** Primary: ${colors.primary}, Secondary: ${colors.secondary}, Accent: ${colors.accent}

CRÉE UN SITE UNIQUE ET PROFESSIONNEL AVEC:

=== HERO SECTION (ÉPIQUE) ===
- Gradient overlay sur image
- Animation de texte qui apparaît progressivement
- Titre ${client.name} ENORME et stylisé
- Slogan percutant et unique
- 2 boutons CTA animés
- Scroll indicator animé

=== SECTION À PROPOS (IMPACTANTE) ===
- Layout moderne (image + texte)
- Histoire captivante de ${client.name}
- Chiffres clés animés (clients satisfaits, années d'expérience, etc.)
- Bouton "En savoir plus"

=== NOS SERVICES (6 services) ===
- Cartes avec icônes grandes
- Hover effects impressionnants
- Titres et descriptions professionnelles
- Numéros stylisés

=== POURQUOI NOUS CHOISIR ===
- 4 raisons avec icônes
- Animations au scroll
- Design moderne

=== TÉMOIGNAGES (3 clients) ===
- Photos placeholder
- Noms sénégalais (Awa, Modou, Fatou...)
- Commentaires authentiques et longs
- Étoiles dorées
- Carrousel ou slider

=== GALERIE (6 images) ===
- Grille masonry moderne
- Lightbox effect
- Hover zoom

=== SECTION CONTACT ===
- Formulaire stylisé
- Google Maps placeholder
- Infos de contact avec icônes
- Horaires d'ouverture

=== FOOTER COMPLET ===
- Logo
- Navigation
- Réseaux sociaux
- Newsletter
- Copyright

**CSS AVANCÉ REQUIS:**
- Keyframe animations (fade-in, slide-up, bounce, pulse)
- Hover effects partout
- Smooth scroll
- Parallax subtil
- Gradients élégants
- Box shadows premium
- Border-radius modernes
- Typography hiérarchisée
- 100% responsive avec media queries

**LIEN WHATSAPP:** https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}

Réponds UNIQUEMENT en JSON valide:
{
  "html": "code html complet et détaillé",
  "css": "css complet avec toutes les animations"
}`

    const completion = await zai.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'Tu es un designer web expert premium. Tu crées des sites exceptionnels avec animations CSS avancées. Tu réponds uniquement en JSON valide.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 6000
    })

    const content = completion.choices[0]?.message?.content
    
    if (!content) {
      throw new Error('Pas de réponse de l\'IA')
    }

    // Parser le JSON
    let clean = content.trim()
    if (clean.includes('```json')) {
      clean = clean.split('```json')[1]
    }
    if (clean.includes('```')) {
      clean = clean.split('```')[0]
    }

    const { html, css } = JSON.parse(clean.trim())

    // Injecter l'image hero si générée
    let finalHtml = html
    if (heroImage) {
      // Ajouter l'image en base64 dans le hero
      finalHtml = finalHtml.replace(
        /<section[^>]*class="hero[^"]*"[^>]*>/,
        `<section class="hero" style="background-image: url('data:image/png;base64,${heroImage}'); background-size: cover; background-position: center;">`
      )
    }

    // Sauvegarder
    const { error } = await supabase
      .from('site_contents')
      .upsert({
        client_id: clientId,
        html_content: finalHtml,
        css_content: css,
        generated_at: new Date().toISOString()
      })

    if (error) throw error

    console.log(`✅ Site amélioré pour ${client.name}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Site amélioré avec succès',
      siteUrl: `/${client.slug}` 
    })

  } catch (error) {
    console.error('Erreur amélioration:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erreur lors de l\'amélioration' 
    }, { status: 500 })
  }
}
