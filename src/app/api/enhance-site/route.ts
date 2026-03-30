import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { enhanceSiteWithAI, getAI, parseAIJSON } from '@/lib/ai-service'

// Générer une image avec l'IA
async function generateImage(prompt: string): Promise<string | null> {
  try {
    const zai = await getAI()
    
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

    // Générer le site avec l'IA
    const { html, css } = await enhanceSiteWithAI({
      name: client.name,
      activity: client.activity,
      city: client.city,
      address: client.address,
      whatsapp: client.whatsapp,
    })

    // Injecter l'image hero si générée
    let finalHtml = html
    if (heroImage) {
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
