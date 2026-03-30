'use client'

import { useEffect, useState, use } from 'react'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'

export default function SitePage() {
  const { slug } = use()
  const [loading, setLoading] = useState(true)
  const [hasSite, setHasSite] = useState(false)
  const [client, setClient] = useState<any>(null)
  const [site, setSite] = useState<{ html: string; css: string } | null>(null)
  const [error, setError] = useState(false)

  // Polling: vérifie si le site est prêt
  const checkSite = async () => {
    try {
      const res = await fetch(`/api/site-data?slug=${encodeURIComponent(slug)}`, {
        headers: { 'Cache-Control': 'no-cache' },
      })
      
      if (!res.ok) {
        setError(true)
        setLoading(false)
        return false
      }

      const data = await res.json()
      setClient(data.client)

      if (data.hasSite && data.site) {
        setHasSite(true)
        setSite(data.site)
        setLoading(false)
        return true
      }

      return false
    } catch (err) {
      console.error('Erreur vérification:', err)
      setError(true)
      setLoading(false)
      return false
    }
  }

  useEffect(() => {
    if (!slug) return

    // Première vérification immédiate
    checkSite()

    // Puis polling toutes les 10 secondes
    const interval = setInterval(async () => {
      const found = await checkSite()
      if (found) {
        clearInterval(interval)
      }
    }, 10000)

    // Arrêter après 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setLoading(false)
      setError(true)
    }, 300000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [slug])

  // Page 404
  if (error && !client) {
    notFound()
  }

  // Page d'attente
  if (loading || (!hasSite && !error)) {
    return (
      <html lang="fr">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{client?.name || '...'} - Site en cours de création</title>
          <meta name="robots" content="noindex" />
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
            <h1>{client?.name || '...'}</h1>
            <p className="activity">{client?.activity || ''} • {client?.city || ''}</p>
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
            <p className="refresh pulse">La page se met à jour automatiquement</p>
            <a 
              href={`https://wa.me/${client?.whatsapp?.replace(/[^0-9]/g, '') || ''}`} 
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

  // Erreur / timeout
  if (error) {
    return (
      <html lang="fr">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Erreur - Site non trouvé</title>
          <meta name="robots" content="noindex" />
          <style dangerouslySetInnerHTML={{ __html: `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f3f4f6; color: #333; }
            .container { text-align: center; padding: 2rem; }
            h1 { font-size: 2rem; margin-bottom: 1rem; color: #ef4444; }
            p { font-size: 1.1rem; color: #666; margin-bottom: 2rem; }
            a { display: inline-block; padding: 0.75rem 2rem; background: #3b82f6; color: white; border-radius: 12px; text-decoration: none; font-weight: 600; }
          `}} />
        </head>
        <body>
          <div className="container">
            <h1>⚠️ Site en cours de création</h1>
            <p>Le site n'est pas encore prêt. Veuillez revenir dans quelques minutes.</p>
            <a href="/">Retour à l'accueil</a>
          </div>
        </body>
      </html>
    )
  }

  // Site prêt !
  if (hasSite && site) {
    return (
      <html lang="fr">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{client?.name} - {client?.activity}</title>
          <meta name="description" content={`${client?.name} - ${client?.activity} à ${client?.city}`} />
          <meta name="robots" content="noindex" />
          <style dangerouslySetInnerHTML={{ __html: `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            ${site.css || ''}
          `}} />
        </head>
        <body>
          <div dangerouslySetInnerHTML={{ __html: site.html }} />
        </body>
      </html>
    )
  }

  return null
}
