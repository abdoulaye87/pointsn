import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function triggerGeneration(clientId: string, baseUrl: string) {
  try {
    await fetch(`${baseUrl}/api/generate-site`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId })
    })
  } catch (error) {
    console.error('Erreur génération:', error)
  }
}

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

  // Si pas de site généré, déclencher la génération et afficher page d'attente
  if (!siteContent) {
    // Déclencher la génération
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    triggerGeneration(client.id, baseUrl)

    return (
      <html lang="fr">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{client.name} - Génération en cours</title>
          <meta httpEquiv="refresh" content="5" />
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
            .container { text-align: center; max-width: 400px; }
            h1 { font-size: 2rem; margin-bottom: 0.5rem; }
            .activity { font-size: 1.1rem; opacity: 0.9; margin-bottom: 1.5rem; }
            .card {
              background: rgba(255,255,255,0.15);
              backdrop-filter: blur(10px);
              border-radius: 16px;
              padding: 2rem;
              margin-bottom: 1.5rem;
            }
            .loader {
              width: 50px;
              height: 50px;
              border: 3px solid rgba(255,255,255,0.3);
              border-top-color: white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 1rem;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            .info { font-size: 0.95rem; opacity: 0.9; }
            .refresh { font-size: 0.85rem; opacity: 0.7; margin-top: 1rem; }
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
              margin-top: 1rem;
            }
          `}} />
        </head>
        <body>
          <div className="container">
            <h1>{client.name}</h1>
            <p className="activity">{client.activity} • {client.city}</p>
            
            <div className="card">
              <div className="loader"></div>
              <p className="info">🎨 Génération de votre site en cours...</p>
              <p className="refresh">Cette page se rafraîchit automatiquement</p>
            </div>

            <a 
              href={`https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}`} 
              className="whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 Nous contacter
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
