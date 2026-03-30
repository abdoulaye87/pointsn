import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import ZAI from 'z-ai-web-dev-sdk'
import { domains, type DomainConfig } from '@/config/domains'

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

// Generate modern site with AI
async function generateModernSite(client: { 
  name: string
  activity: string
  city: string
  address: string
  whatsapp: string 
}): Promise<{ html: string; css: string }> {
  const domain: DomainConfig = domains[client.activity] || domains.autre
  const { primary, secondary, gradient } = domain.color

  try {
    const zai = await ZAI.create()

    const prompt = `Crée un site web MODERNE et PROFESSIONNEL pour:

ENTREPRISE: ${client.name}
ACTIVITÉ: ${domain.name}
VILLE: ${client.city}  
ADRESSE: ${client.address}
TÉL: ${client.whatsapp}
COULEURS: Primary=${primary}, Secondary=${secondary}

GÉNÈRE UN SITE WEB COMPLET AVEC:

1. HERO SECTION ÉPIQUE:
- Background avec gradient ${gradient}
- Animation d'entrée (fade-in, slide-up)
- Titre "${client.name}" ENORME
- Slogan accrocheur: "${domain.slogan[0]}"
- Boutons animés avec hover effects
- Pattern animé en arrière-plan

2. SECTION SERVICES (6 services):
${domain.services.map(s => `- ${s.icon} ${s.name}: ${s.desc}`).join('\n')}

3. SECTION TÉMOIGNAGES (3 avis):
${domain.testimonials.map(t => `- ${t.name}: "${t.text}"`).join('\n')}

4. SECTION CONTACT:
- Adresse: ${client.address}, ${client.city}
- WhatsApp: ${client.whatsapp} (lien: https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')})
- Horaires: ${domain.hours || 'Lun-Sam: 8h-18h'}

5. GALERIE (6 placeholders avec ${domain.icon})

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

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Tu es un expert en création de sites web modernes et luxueux. Tu crées des designs époustouflants avec des animations CSS avancées. Tu réponds UNIQUEMENT en JSON valide.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4000
    })

    const content = completion.choices[0]?.message?.content
    
    if (!content) {
      throw new Error('Pas de réponse IA')
    }

    // Parse JSON
    let clean = content.trim()
    if (clean.includes('```json')) clean = clean.split('```json')[1]
    if (clean.includes('```')) clean = clean.split('```')[0]
    
    return JSON.parse(clean.trim())

  } catch (error) {
    console.error('Erreur IA, utilisation template:', error)
    return generateFallbackTemplate(client, domain)
  }
}

// Fallback template if AI fails
function generateFallbackTemplate(client: { name: string; activity: string; city: string; address: string; whatsapp: string }, domain: DomainConfig) {
  const { primary, secondary, gradient } = domain.color
  const slogan = domain.slogan[Math.floor(Math.random() * domain.slogan.length)]

  const html = `
<div class="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <span class="hero-icon">${domain.icon}</span>
    <h1 class="hero-title">${client.name}</h1>
    <p class="hero-slogan">${slogan}</p>
    <div class="hero-buttons">
      <a href="#services" class="btn btn-primary">Découvrir</a>
      <a href="https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}" class="btn btn-outline" target="_blank">💬 Contact</a>
    </div>
  </div>
  <div class="scroll-down">↓</div>
</div>

<section id="about" class="about">
  <div class="container">
    <h2 class="title">À Propos</h2>
    <p class="about-text"><strong>${client.name}</strong> est votre partenaire de confiance pour ${domain.name.toLowerCase()} à ${client.city}. Nous offrons des services de qualité exceptionnelle depuis plusieurs années.</p>
    <div class="stats">
      <div class="stat"><span class="num">500+</span><span class="label">Clients</span></div>
      <div class="stat"><span class="num">5★</span><span class="label">Note</span></div>
      <div class="stat"><span class="num">100%</span><span class="label">Satisfaction</span></div>
    </div>
  </div>
</section>

<section id="services" class="services">
  <div class="container">
    <h2 class="title">Nos Services</h2>
    <div class="grid">
      ${domain.services.map(s => `<div class="card"><span class="icon">${s.icon}</span><h3>${s.name}</h3><p>${s.desc}</p></div>`).join('')}
    </div>
  </div>
</section>

<section id="testimonials" class="testimonials">
  <div class="container">
    <h2 class="title">Avis Clients</h2>
    <div class="grid">
      ${domain.testimonials.map(t => `<div class="card"><div class="stars">⭐⭐⭐⭐⭐</div><p>"${t.text}"</p><span class="author">— ${t.name}</span></div>`).join('')}
    </div>
  </div>
</section>

<section id="gallery" class="gallery">
  <div class="container">
    <h2 class="title">Galerie</h2>
    <div class="grid">${domain.galleryPlaceholders.map(p => `<div class="item"><span>${p}</span></div>`).join('')}</div>
  </div>
</section>

<section id="contact" class="contact">
  <div class="container">
    <h2 class="title">Contact</h2>
    <div class="contact-grid">
      <div class="info">
        <div class="item"><span>📍</span><div><strong>Adresse</strong><p>${client.address}, ${client.city}</p></div></div>
        <div class="item"><span>📞</span><div><strong>Téléphone</strong><p>${client.whatsapp}</p></div></div>
        <div class="item"><span>🕐</span><div><strong>Horaires</strong><p>${domain.hours || 'Lun-Sam: 8h-18h'}</p></div></div>
      </div>
      <form class="form">
        <input type="text" placeholder="Votre nom" />
        <input type="tel" placeholder="Votre téléphone" />
        <textarea placeholder="Votre message"></textarea>
        <a href="https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}" class="btn btn-primary btn-block" target="_blank">💬 Envoyer via WhatsApp</a>
      </form>
    </div>
  </div>
</section>

<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div><span class="footer-icon">${domain.icon}</span><h3>${client.name}</h3><p>${domain.name} • ${client.city}</p></div>
      <div class="links"><a href="#about">À propos</a><a href="#services">Services</a><a href="#contact">Contact</a></div>
    </div>
    <p class="copyright">© ${new Date().getFullYear()} ${client.name} • Créé avec IASN</p>
  </div>
</footer>

<a href="https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}" class="wa-float" target="_blank">💬</a>
`

  const css = `
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1f2937}
.container{max-width:1100px;margin:0 auto;padding:0 20px}

/* ANIMATIONS */
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

/* HERO */
.hero{min-height:100vh;background:${gradient};display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E");animation:float 8s ease-in-out infinite}
.hero-content{position:relative;z-index:1;padding:40px 20px;animation:slideUp 1s ease}
.hero-icon{font-size:4rem;display:block;margin-bottom:16px;animation:bounce 2s infinite}
.hero-title{font-size:clamp(2.5rem,8vw,4rem);font-weight:800;margin-bottom:12px;text-shadow:0 4px 40px rgba(0,0,0,.3)}
.hero-slogan{font-size:clamp(1.1rem,3vw,1.5rem);opacity:.95;margin-bottom:32px}
.hero-buttons{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.scroll-down{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);font-size:2rem;animation:bounce 2s infinite;opacity:.6}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;padding:14px 28px;border-radius:50px;font-weight:600;font-size:1rem;text-decoration:none;transition:all .3s;cursor:pointer}
.btn-primary{background:#fff;color:${primary}}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 12px 35px rgba(0,0,0,.2)}
.btn-outline{background:rgba(255,255,255,.15);color:#fff;border:2px solid #fff}
.btn-outline:hover{background:#fff;color:${primary}}
.btn-block{width:100%}

/* SECTIONS */
section{padding:60px 0}
.title{font-size:2rem;font-weight:700;text-align:center;margin-bottom:40px;position:relative}
.title::after{content:'';display:block;width:60px;height:4px;background:${gradient};margin:12px auto 0;border-radius:2px}

/* ABOUT */
.about{background:#f9fafb}
.about-text{max-width:650px;margin:0 auto 30px;text-align:center;font-size:1.1rem;color:#4b5563}
.stats{display:flex;justify-content:center;gap:24px;flex-wrap:wrap}
.stat{background:#fff;padding:20px 30px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.06);text-align:center}
.num{display:block;font-size:1.75rem;font-weight:800;color:${primary}}
.label{font-size:.85rem;color:#6b7280}

/* SERVICES */
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
.services .card{background:#fff;padding:24px;border-radius:12px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.06);border:1px solid #f3f4f6;transition:all .3s}
.services .card:hover{transform:translateY(-6px);box-shadow:0 20px 45px rgba(0,0,0,.1);border-color:${primary}}
.services .icon{font-size:2.5rem;margin-bottom:12px;display:block}
.services h3{font-size:1.1rem;margin-bottom:8px}
.services p{color:#6b7280;font-size:.9rem}

/* TESTIMONIALS */
.testimonials{background:${gradient};color:#fff}
.testimonials .title{color:#fff}
.testimonials .title::after{background:rgba(255,255,255,.4)}
.testimonials .card{background:rgba(255,255,255,.12);backdrop-filter:blur(10px);padding:24px;border-radius:12px;border:1px solid rgba(255,255,255,.15)}
.stars{font-size:1rem;margin-bottom:12px}
.testimonials p{font-style:italic;margin-bottom:16px;line-height:1.6}
.author{font-weight:600;font-size:.9rem}

/* GALLERY */
.gallery .grid{grid-template-columns:repeat(3,1fr);gap:12px}
.gallery .item{aspect-ratio:1;background:${gradient};border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.9rem;transition:all .3s}
.gallery .item:hover{transform:scale(1.03)}

/* CONTACT */
.contact{background:#f9fafb}
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.contact .item{display:flex;gap:16px;margin-bottom:20px}
.contact .item span{font-size:1.5rem}
.contact .item strong{display:block;margin-bottom:4px}
.contact .item p{color:#6b7280;font-size:.95rem}
.form{display:flex;flex-direction:column;gap:12px}
.form input,.form textarea{padding:14px;border:2px solid #e5e7eb;border-radius:8px;font-size:1rem;transition:border-color .3s}
.form input:focus,.form textarea:focus{outline:none;border-color:${primary}}
.form textarea{min-height:100px;resize:vertical}

/* FOOTER */
.footer{background:#111827;color:#fff;padding:40px 0 20px}
.footer-content{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px;margin-bottom:24px}
.footer-icon{font-size:2rem}
.footer h3{font-size:1.2rem;margin-bottom:4px}
.footer p{color:#9ca3af;font-size:.9rem}
.links{display:flex;gap:20px}
.links a{color:#9ca3af;text-decoration:none;transition:color}
.links a:hover{color:#fff}
.copyright{text-align:center;padding-top:20px;border-top:1px solid #374151;color:#6b7280;font-size:.85rem}

/* WHATSAPP */
.wa-float{position:fixed;bottom:24px;right:24px;width:60px;height:60px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;text-decoration:none;box-shadow:0 6px 25px rgba(37,211,102,.4);z-index:1000;animation:pulse 2s infinite}

/* RESPONSIVE */
@media(max-width:768px){
  .contact-grid{grid-template-columns:1fr}
  .gallery .grid{grid-template-columns:repeat(2,1fr)}
  .footer-content{flex-direction:column;text-align:center}
  .hero-buttons{flex-direction:column}.btn{width:100%}
}
`

  return { html, css }
}

// POST - Create client with AI-generated site
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, activity, city, address, whatsapp } = body

    if (!name || !activity || !city || !address || !whatsapp) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    // Generate unique slug
    const baseSlug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    let slug = baseSlug
    let counter = 1

    const { data: existingClient } = await supabase.from('clients').select('slug').eq('slug', slug).single()
    while (existingClient) {
      slug = `${baseSlug}-${counter}`
      const { data: checkSlug } = await supabase.from('clients').select('slug').eq('slug', slug).single()
      if (!checkSlug) break
      counter++
    }

    // Create client
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7)

    const { data: client, error } = await supabase
      .from('clients')
      .insert({ name, activity, city, address, whatsapp, slug, trial_ends_at: trialEndsAt.toISOString(), payment_status: 'trial' })
      .select()
      .single()

    if (error) throw error

    // Generate site with AI
    console.log(`🎨 Génération site IA pour ${name} (${activity})...`)
    const { html, css } = await generateModernSite({ name, activity, city, address, whatsapp })

    // Save
    const { error: siteError } = await supabase
      .from('site_contents')
      .insert({ client_id: client.id, html_content: html, css_content: css })

    if (siteError) console.error('Erreur sauvegarde:', siteError)
    console.log(`✅ Site créé pour ${name}`)

    return NextResponse.json({ ...client, hasSite: !siteError, siteUrl: `/${slug}` })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
