import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Génération de template rapide
function generateTemplate(client: { 
  name: string
  activity: string
  city: string
  address: string
  whatsapp: string 
}) {
  const colors: Record<string, { primary: string, secondary: string }> = {
    restaurant: { primary: '#ff6b35', secondary: '#f7c59f' },
    coiffure: { primary: '#e91e63', secondary: '#f8bbd9' },
    boutique: { primary: '#9c27b0', secondary: '#e1bee7' },
    immobilier: { primary: '#2196f3', secondary: '#bbdefb' },
    default: { primary: '#667eea', secondary: '#764ba2' }
  }
  
  const color = colors[client.activity.toLowerCase()] || colors.default
  
  const html = `
<div class="hero">
  <div class="hero-content">
    <span class="emoji">${getEmoji(client.activity)}</span>
    <h1>${client.name}</h1>
    <p class="tagline">${getTagline(client.activity)}</p>
  </div>
</div>

<section class="about">
  <h2>À propos de nous</h2>
  <p>${client.name} est votre partenaire de confiance pour tous vos besoins en ${client.activity} à ${client.city}. Nous offrons des services de qualité supérieure avec un engagement envers l'excellence.</p>
</section>

<section class="services">
  <h2>Nos Services</h2>
  <div class="services-grid">
    ${getServices(client.activity).map(s => `
    <div class="service-card">
      <span class="service-icon">${s.icon}</span>
      <h3>${s.name}</h3>
    </div>
    `).join('')}
  </div>
</section>

<section class="contact">
  <h2>Nous Contacter</h2>
  <div class="contact-info">
    <div class="contact-item">
      <span>📍</span>
      <p>${client.address}, ${client.city}</p>
    </div>
    <div class="contact-item">
      <span>📞</span>
      <p>${client.whatsapp}</p>
    </div>
  </div>
</section>

<a href="https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}" class="whatsapp-btn">
  💬 Contactez-nous
</a>

<footer>
  <p>© ${new Date().getFullYear()} ${client.name} - Créé avec IASN</p>
</footer>
`

  const css = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }

.hero { 
  background: linear-gradient(135deg, ${color.primary}, ${color.secondary});
  color: white; 
  padding: 4rem 1rem; 
  text-align: center;
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-content { max-width: 600px; }
.emoji { font-size: 4rem; display: block; margin-bottom: 1rem; }
.hero h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
.tagline { font-size: 1.3rem; opacity: 0.9; }

section { padding: 3rem 1rem; max-width: 900px; margin: 0 auto; }
h2 { color: ${color.primary}; margin-bottom: 1.5rem; font-size: 1.8rem; text-align: center; }
p { font-size: 1.1rem; }

.about { background: #f9f9f9; }

.services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
.service-card { 
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}
.service-card:hover { transform: translateY(-5px); }
.service-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
.service-card h3 { font-size: 1.1rem; color: #333; }

.contact { background: linear-gradient(135deg, ${color.primary}10, ${color.secondary}20); }
.contact-info { display: flex; flex-direction: column; gap: 1rem; align-items: center; }
.contact-item { display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem; }
.contact-item span { font-size: 1.5rem; }

.whatsapp-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #25d366;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
  z-index: 1000;
  transition: transform 0.3s;
}
.whatsapp-btn:hover { transform: scale(1.05); }

footer { 
  background: #333; 
  color: white; 
  text-align: center; 
  padding: 2rem 1rem; 
  margin-top: 2rem;
}

@media (max-width: 600px) {
  .hero h1 { font-size: 2rem; }
  .emoji { font-size: 3rem; }
}
`

  return { html, css }
}

function getEmoji(activity: string): string {
  const emojis: Record<string, string> = {
    restaurant: '🍽️',
    coiffure: '💇',
    boutique: '🛍️',
    immobilier: '🏠',
    default: '✨'
  }
  return emojis[activity.toLowerCase()] || emojis.default
}

function getTagline(activity: string): string {
  const taglines: Record<string, string> = {
    restaurant: 'Une expérience culinaire inoubliable',
    coiffure: 'Votre beauté, notre passion',
    boutique: 'Qualité et style à prix abordables',
    immobilier: 'Trouvez la maison de vos rêves',
    default: 'L\'excellence à votre service'
  }
  return taglines[activity.toLowerCase()] || taglines.default
}

function getServices(activity: string): { icon: string, name: string }[] {
  const services: Record<string, { icon: string, name: string }[]> = {
    restaurant: [
      { icon: '🍽️', name: 'Cuisine Sénégalaise' },
      { icon: '🥗', name: 'Plats Européens' },
      { icon: '🎂', name: 'Pâtisserie' },
      { icon: '🚚', name: 'Livraison' }
    ],
    coiffure: [
      { icon: '✂️', name: 'Coupe Homme' },
      { icon: '💇‍♀️', name: 'Coiffure Femme' },
      { icon: '💅', name: 'Manucure' },
      { icon: '✨', name: 'Soins Visage' }
    ],
    boutique: [
      { icon: '👕', name: 'Vêtements' },
      { icon: '👟', name: 'Chaussures' },
      { icon: '👜', name: 'Accessoires' },
      { icon: '🎁', name: 'Cadeaux' }
    ],
    default: [
      { icon: '⭐', name: 'Service Premium' },
      { icon: '✨', name: 'Qualité Garantie' },
      { icon: '🚀', name: 'Rapidité' },
      { icon: '💼', name: 'Professionnalisme' }
    ]
  }
  return services[activity.toLowerCase()] || services.default
}

// POST - Générer un site
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId } = body

    if (!clientId) {
      return NextResponse.json({ error: 'ID client requis' }, { status: 400 })
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    const { html, css } = generateTemplate(client)

    const { error } = await supabase
      .from('site_contents')
      .upsert({
        client_id: clientId,
        html_content: html,
        css_content: css,
        generated_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      siteUrl: `/${client.slug}` 
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET - Régénérer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ error: 'ID client requis' }, { status: 400 })
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    const { html, css } = generateTemplate(client)

    const { error } = await supabase
      .from('site_contents')
      .upsert({
        client_id: clientId,
        html_content: html,
        css_content: css,
        generated_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      siteUrl: `/${client.slug}` 
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
