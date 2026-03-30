import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { domains, type DomainConfig } from '@/config/domains'
import ZAI from 'z-ai-web-dev-sdk'

// GET - List all clients
export async function GET() {
  try {
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientsError) throw clientsError

    const { data: payments } = await supabase.from('payments').select('*')
    const { data: modifications } = await supabase.from('modifications').select('*')
    const { data: siteContents } = await supabase
      .from('site_contents')
      .select('client_id, id, generated_at')

    const clientsWithRelations = clients?.map(client => ({
      ...client,
      payments: payments?.filter(p => p.client_id === client.id) || [],
      modifications: modifications?.filter(m => m.client_id === client.id) || [],
      hasSite: siteContents?.some(s => s.client_id === client.id) || false
    }))

    return NextResponse.json(clientsWithRelations)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Generate base template quickly
function generateBaseTemplate(client: { 
  name: string
  activity: string
  city: string
  address: string
  whatsapp: string 
}) {
  const domain: DomainConfig = domains[client.activity] || domains.autre
  const { primary, secondary, gradient } = domain.color
  const services = domain.services
  const testimonials = domain.testimonials
  const slogan = domain.slogan[Math.floor(Math.random() * domain.slogan.length)]
  const hours = domain.hours || 'Lun-Sam: 8h - 18h'

  const html = `
<div class="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <span class="hero-icon">${domain.icon}</span>
    <h1>${client.name}</h1>
    <p class="hero-slogan">${slogan}</p>
    <div class="hero-btns">
      <a href="#services" class="btn btn-white">Nos Services</a>
      <a href="https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}" class="btn btn-outline" target="_blank">💬 Contacter</a>
    </div>
  </div>
  <div class="scroll-down">↓</div>
</div>

<section id="about" class="section about">
  <div class="container">
    <h2 class="title">À Propos</h2>
    <p style="text-align:center;max-width:600px;margin:0 auto 2rem;color:#4b5563;">
      <strong>${client.name}</strong> est votre partenaire de confiance pour tous vos besoins en <strong>${domain.name}</strong> à <strong>${client.city}</strong>.
    </p>
    <div class="stats">
      <div class="stat"><span class="num">500+</span><span class="label">Clients</span></div>
      <div class="stat"><span class="num">5⭐</span><span class="label">Note</span></div>
      <div class="stat"><span class="num">100%</span><span class="label">Satisfaction</span></div>
    </div>
  </div>
</section>

<section id="services" class="section services">
  <div class="container">
    <h2 class="title">Nos Services</h2>
    <div class="grid">
      ${services.map(s => `
      <div class="card">
        <span class="icon">${s.icon}</span>
        <h3>${s.name}</h3>
        <p>${s.desc}</p>
      </div>
      `).join('')}
    </div>
  </div>
</section>

<section class="section testimonials">
  <div class="container">
    <h2 class="title" style="color:white">Avis Clients</h2>
    <div class="grid">
      ${testimonials.map(t => `
      <div class="review">
        <div class="stars">⭐⭐⭐⭐⭐</div>
        <p>"${t.text}"</p>
        <span class="author">— ${t.name}</span>
      </div>
      `).join('')}
    </div>
  </div>
</section>

<section id="contact" class="section contact">
  <div class="container">
    <h2 class="title">Contact</h2>
    <div class="contact-grid">
      <div class="info">
        <div class="item"><span>📍</span><div><strong>Adresse</strong><p>${client.address}, ${client.city}</p></div></div>
        <div class="item"><span>📞</span><div><strong>Téléphone</strong><p>${client.whatsapp}</p></div></div>
        <div class="item"><span>🕐</span><div><strong>Horaires</strong><p>${hours}</p></div></div>
      </div>
      <form class="form" onsubmit="event.preventDefault();window.open('https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}','_blank')">
        <input type="text" placeholder="Votre nom" required>
        <input type="tel" placeholder="Votre téléphone" required>
        <textarea placeholder="Votre message" required></textarea>
        <button type="submit" class="btn btn-primary btn-block">💬 Envoyer via WhatsApp</button>
      </form>
    </div>
  </div>
</section>

<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div><span style="font-size:2rem">${domain.icon}</span><h3>${client.name}</h3><p>${domain.name}</p></div>
      <div class="links"><a href="#about">À propos</a><a href="#services">Services</a><a href="#contact">Contact</a></div>
    </div>
    <p class="copyright">© ${new Date().getFullYear()} ${client.name} - Créé avec IASN</p>
  </div>
</footer>

<a href="https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}" class="wa-btn" target="_blank">💬</a>
`

  const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Segoe UI',system-ui,sans-serif;line-height:1.6;color:#1f2937}
.container{max-width:1100px;margin:0 auto;padding:0 1rem}

/* HERO */
.hero{min-height:100vh;background:${gradient};position:relative;display:flex;align-items:center;justify-content:center;text-align:center;color:white;overflow:hidden}
.hero-bg{position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");animation:move 30s linear infinite}
@keyframes move{to{background-position:60px 60px}}
.hero-content{position:relative;z-index:1;padding:2rem}
.hero-icon{font-size:4rem;display:block;margin-bottom:1rem;animation:bounce 2s infinite}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.hero h1{font-size:clamp(2.5rem,8vw,4rem);font-weight:800;margin-bottom:.5rem;text-shadow:0 4px 30px rgba(0,0,0,.3)}
.hero-slogan{font-size:clamp(1.1rem,3vw,1.5rem);opacity:.95;margin-bottom:2rem}
.hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.scroll-down{position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);font-size:2rem;animation:bounce 2s infinite;opacity:.7}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;padding:1rem 2rem;border-radius:50px;font-weight:600;text-decoration:none;transition:all .3s;border:none;cursor:pointer;font-size:1rem}
.btn-white{background:white;color:${primary}}
.btn-white:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(0,0,0,.2)}
.btn-outline{background:rgba(255,255,255,.2);color:white;border:2px solid white}
.btn-outline:hover{background:white;color:${primary}}
.btn-primary{background:${gradient};color:white}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(0,0,0,.2)}
.btn-block{width:100%}

/* SECTIONS */
.section{padding:4rem 0}
.title{font-size:2rem;font-weight:700;text-align:center;margin-bottom:2rem}
.title::after{content:'';display:block;width:60px;height:4px;background:${gradient};margin:.75rem auto 0;border-radius:2px}

/* ABOUT */
.about{background:#f9fafb}
.stats{display:flex;justify-content:center;gap:2rem;flex-wrap:wrap}
.stat{background:white;padding:1.25rem 2rem;border-radius:1rem;box-shadow:0 4px 20px rgba(0,0,0,.08);text-align:center}
.stat .num{display:block;font-size:1.75rem;font-weight:800;color:${primary}}
.stat .label{font-size:.85rem;color:#6b7280}

/* SERVICES */
.services .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem}
.card{background:white;padding:1.75rem;border-radius:1rem;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.08);border:1px solid #f3f4f6;transition:all .3s}
.card:hover{transform:translateY(-5px);box-shadow:0 20px 40px rgba(0,0,0,.12);border-color:${primary}}
.card .icon{font-size:2.5rem;display:block;margin-bottom:.75rem}
.card h3{font-size:1.1rem;font-weight:700;margin-bottom:.25rem}
.card p{color:#6b7280;font-size:.9rem}

/* TESTIMONIALS */
.testimonials{background:${gradient};color:white}
.testimonials .title::after{background:rgba(255,255,255,.5)}
.testimonials .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
.review{background:rgba(255,255,255,.15);backdrop-filter:blur(10px);padding:1.5rem;border-radius:1rem;border:1px solid rgba(255,255,255,.2)}
.stars{font-size:1rem;margin-bottom:.75rem}
.review p{font-style:italic;margin-bottom:1rem;line-height:1.6}
.author{font-weight:600;font-size:.9rem}

/* CONTACT */
.contact{background:#f9fafb}
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;max-width:800px;margin:0 auto}
.item{display:flex;gap:1rem;margin-bottom:1.25rem}
.item span{font-size:1.75rem}
.item strong{display:block;margin-bottom:.25rem}
.item p{color:#6b7280;font-size:.95rem}
.form{display:flex;flex-direction:column;gap:.75rem}
.form input,.form textarea{padding:.875rem;border:2px solid #e5e7eb;border-radius:.5rem;font-size:1rem;transition:border-color .3s}
.form input:focus,.form textarea:focus{outline:none;border-color:${primary}}
.form textarea{min-height:100px;resize:vertical}

/* FOOTER */
.footer{background:#111827;color:white;padding:2.5rem 0 1.5rem}
.footer-content{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1.5rem;margin-bottom:1.5rem}
.footer h3{font-size:1.25rem;margin:.25rem 0}
.footer p{color:#9ca3af;font-size:.9rem}
.links{display:flex;gap:1.5rem}
.links a{color:#9ca3af;text-decoration:none;transition:color}
.links a:hover{color:white}
.copyright{text-align:center;padding-top:1.5rem;border-top:1px solid #374151;color:#6b7280;font-size:.85rem}

/* WHATSAPP */
.wa-btn{position:fixed;bottom:1.5rem;right:1.5rem;width:56px;height:56px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;text-decoration:none;box-shadow:0 4px 20px rgba(37,211,102,.4);z-index:1000;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}

/* RESPONSIVE */
@media(max-width:768px){
  .contact-grid{grid-template-columns:1fr}
  .footer-content{flex-direction:column;text-align:center}
  .hero-btns{flex-direction:column}
  .btn{width:100%}
}
`

  return { html, css }
}

// Enhance site with AI in background
async function enhanceWithAI(clientId: string, clientData: {
  name: string
  activity: string
  city: string
  address: string
  whatsapp: string
}) {
  try {
    const domain: DomainConfig = domains[clientData.activity] || domains.autre
    const zai = await ZAI.create()

    const prompt = `Crée du contenu professionnel pour le site de "${clientData.name}" (${domain.name} à ${clientData.city}).

Génère en JSON:
{
  "hero_subtitle": "Slogan accrocheur (10 mots max)",
  "about_text": "Description de l'entreprise (3 phrases, 50 mots)",
  "special_offer": "Offre spéciale ou promotion (ex: -20% pour les nouveaux clients)",
  "features": ["Avantage 1", "Avantage 2", "Avantage 3", "Avantage 4"]
}`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Tu crées du contenu marketing professionnel. Réponds en JSON uniquement.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 500
    })

    const content = completion.choices[0]?.message?.content
    if (!content) return

    // Parse and update
    let clean = content.trim()
    if (clean.includes('```')) {
      clean = clean.replace(/```json?/g, '').replace(/```/g, '')
    }
    
    const aiContent = JSON.parse(clean)
    
    // Get existing content
    const { data: existing } = await supabase
      .from('site_contents')
      .select('html_content')
      .eq('client_id', clientId)
      .single()

    if (existing) {
      // Inject AI content
      let html = existing.html_content
      
      if (aiContent.hero_subtitle) {
        html = html.replace(/<p class="hero-slogan">.*?<\/p>/, `<p class="hero-slogan">${aiContent.hero_subtitle}</p>`)
      }
      
      if (aiContent.about_text) {
        html = html.replace(
          /<p style="text-align:center;max-width:600px;margin:0 auto 2rem;color:#4b5563;">.*?<\/p>/,
          `<p style="text-align:center;max-width:600px;margin:0 auto 2rem;color:#4b5563;">${aiContent.about_text}</p>`
        )
      }

      if (aiContent.special_offer) {
        // Add banner
        const banner = `<div class="banner">${aiContent.special_offer}</div>`
        if (!html.includes('class="banner"')) {
          html = html.replace('</head>', `<style>.banner{background:linear-gradient(90deg,#fbbf24,#f59e0b);color:#000;text-align:center;padding:0.75rem;font-weight:600;position:sticky;top:0;z-index:100}</style></head>`)
          html = html.replace('<body>', `<body>${banner}`)
        }
      }

      await supabase
        .from('site_contents')
        .update({ html_content: html })
        .eq('client_id', clientId)
    }

    console.log(`✅ Site enrichi avec IA pour ${clientData.name}`)
  } catch (error) {
    console.error('Erreur enrichissement IA:', error)
  }
}

// POST - Create client with template + AI enhancement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, activity, city, address, whatsapp } = body

    if (!name || !activity || !city || !address || !whatsapp) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    let slug = baseSlug
    let counter = 1

    const { data: existingClient } = await supabase
      .from('clients')
      .select('slug')
      .eq('slug', slug)
      .single()

    while (existingClient) {
      slug = `${baseSlug}-${counter}`
      const { data: checkSlug } = await supabase
        .from('clients')
        .select('slug')
        .eq('slug', slug)
        .single()
      if (!checkSlug) break
      counter++
    }

    // Create client
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7)

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name, activity, city, address, whatsapp, slug,
        trial_ends_at: trialEndsAt.toISOString(),
        payment_status: 'trial'
      })
      .select()
      .single()

    if (error) throw error

    // Generate template
    console.log(`🎨 Création du site pour ${name}...`)
    const { html, css } = generateBaseTemplate({ name, activity, city, address, whatsapp })

    // Save
    const { error: siteError } = await supabase
      .from('site_contents')
      .insert({
        client_id: client.id,
        html_content: html,
        css_content: css
      })

    if (siteError) console.error('Erreur sauvegarde site:', siteError)

    // Enhance with AI in background (don't wait)
    enhanceWithAI(client.id, { name, activity, city, address, whatsapp }).catch(e => 
      console.error('Background AI error:', e)
    )

    console.log(`✅ Site créé pour ${name}`)

    return NextResponse.json({
      ...client,
      hasSite: !siteError,
      siteUrl: `/${slug}`,
      aiEnhancing: true
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
