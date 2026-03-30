import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SitePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  
  // Récupérer le client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', slug)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // Récupérer le contenu du site généré
  const { data: siteContent } = await supabase
    .from('site_contents')
    .select('*')
    .eq('client_id', client.id)
    .single()

  // Si pas de site généré, afficher page d'attente
  if (!siteContent) {
    return (
      <html lang="fr">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{client.name} - Site en cours de création</title>
          <meta httpEquiv="refresh" content="30" />
          <style dangerouslySetInnerHTML={{ __html: `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 1rem;
            }
            .container { text-align: center; max-width: 420px; }
            h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
            .activity { font-size: 1.1rem; opacity: 0.9; margin-bottom: 2rem; }
            .card {
              background: rgba(255,255,255,0.15);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              padding: 2.5rem 2rem;
              margin-bottom: 1.5rem;
            }
            .icon { font-size: 4rem; margin-bottom: 1rem; display: block; }
            .loader {
              width: 44px;
              height: 44px;
              border: 3px solid rgba(255,255,255,0.3);
              border-top-color: white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 1.2rem;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            .title { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
            .info { font-size: 0.9rem; opacity: 0.85; line-height: 1.5; }
            .steps { text-align: left; margin-top: 1.5rem; font-size: 0.85rem; opacity: 0.8; }
            .steps div { padding: 0.4rem 0; }
            .steps .done { opacity: 0.6; text-decoration: line-through; }
            .refresh { 
              font-size: 0.8rem; opacity: 0.6; margin-top: 1.5rem; 
              display: flex; align-items: center; justify-content: center; gap: 0.5rem;
            }
            .pulse { animation: pulse 2s ease-in-out infinite; }
            @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
            .whatsapp {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              background: #25d366;
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 50px;
              text-decoration: none;
              font-weight: 600;
              font-size: 0.95rem;
            }
          `}} />
        </head>
        <body>
          <div className="container">
            <h1>{client.name}</h1>
            <p className="activity">{client.activity} • {client.city}</p>
            
            <div className="card">
              <span className="icon">🎨</span>
              <div className="loader"></div>
              <p className="title">Votre site est en cours de création</p>
              <p className="info">
                Notre IA est en train de concevoir votre site web unique. Cela prend environ 1 à 2 minutes.
              </p>
              <div className="steps">
                <div className="done">✅ Informations enregistrées</div>
                <div>🔄 Design IA en cours...</div>
                <div>⏳ Publication imminente</div>
              </div>
            </div>

            <p className="refresh pulse">La page se rafraîchit automatiquement toutes les 30 secondes</p>

            <a 
              href={`https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}`} 
              className="whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 Nous contacter sur WhatsApp
            </a>
          </div>
        </body>
      </html>
    )
  }

  // Afficher le site généré
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{client.name} - {client.activity}</title>
        <meta name="description" content={`${client.name} - ${client.activity} à ${client.city}`} />
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          ${siteContent.css_content || ''}
        `}} />
      </head>
      <body>
        <div dangerouslySetInnerHTML={{ __html: siteContent.html_content }} />
      </body>
    </html>
  )
}
