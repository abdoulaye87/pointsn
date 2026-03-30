'use client'

import { useEffect, useState, useMemo, use } from 'react'

/**
 * Extrait le contenu du body depuis un HTML complet généré par l'IA.
 * L'IA génère souvent un document HTML complet (<!DOCTYPE html><html><head>...<body>...</body></html>).
 * Comme on est déjà dans le layout Next.js (qui fournit <html><body>),
 * on ne garde que le contenu intérieur.
 */
function extractBodyContent(html: string): { body: string; extraCss: string } {
  // 1. Essayer d'extraire le contenu entre <body> et </body>
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  if (bodyMatch) {
    // 2. Extraire les <style> du <head> comme CSS supplémentaire
    let extraCss = ''
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
    if (headMatch) {
      const styleMatches = headMatch[1].matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)
      for (const m of styleMatches) {
        extraCss += m[1] + '\n'
      }
    }
    return { body: bodyMatch[1].trim(), extraCss }
  }

  // 3. Pas de <body> trouvé — nettoyer le HTML
  let cleaned = html
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<\/body>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .trim()

  // Extraire les styles du head si présents
  let extraCss = ''
  const headStyles = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  if (headStyles) {
    const styleMatches = headStyles[1].matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)
    for (const m of styleMatches) {
      extraCss += m[1] + '\n'
    }
  }

  return { body: cleaned, extraCss }
}

export default function SitePage() {
  const { slug } = use()
  const [loading, setLoading] = useState(true)
  const [hasSite, setHasSite] = useState(false)
  const [client, setClient] = useState<any>(null)
  const [site, setSite] = useState<{ html: string; css: string } | null>(null)
  const [error, setError] = useState<string | null>(null) // 'not_found' | 'network' | null
  const [checkCount, setCheckCount] = useState(0)

  const checkSite = async () => {
    try {
      const res = await fetch(`/api/site-data?slug=${encodeURIComponent(slug)}`, {
        headers: { 'Cache-Control': 'no-cache' },
      })

      if (!res.ok) {
        setError('not_found')
        setLoading(false)
        return false
      }

      const data = await res.json()
      setClient(data.client)

      // Update page title
      if (data.client?.name) {
        document.title = hasSite
          ? `${data.client.name} - ${data.client.activity}`
          : `${data.client.name} - Site en cours de création`
      }

      if (data.hasSite && data.site) {
        setHasSite(true)
        setSite(data.site)
        setLoading(false)
        return true
      }

      setLoading(false)
      setCheckCount(prev => prev + 1)
      return false
    } catch {
      setError('network')
      setLoading(false)
      return false
    }
  }

  useEffect(() => {
    if (!slug) return

    // Premier appel immédiat
    checkSite()

    // Polling toutes les 30 secondes
    const interval = setInterval(async () => {
      const found = await checkSite()
      if (found) clearInterval(interval)
    }, 30000)

    return () => clearInterval(interval)
  }, [slug])

  // ──────────────────────────────────────────────
  // État 1 : Client non trouvé (pas de 404erreur, juste un message propre)
  // ──────────────────────────────────────────────
  if (error === 'not_found') {
    return (
      <div style={styles.notFoundContainer}>
        <div style={styles.notFoundBox}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h1 style={styles.notFoundTitle}>Site non trouvé</h1>
          <p style={styles.notFoundText}>
            Ce site n&apos;existe pas ou a été supprimé.
          </p>
          <a href="/" style={styles.notFoundButton}>
            ← Retour à l&apos;accueil
          </a>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────
  // État 2 : Erreur réseau
  // ──────────────────────────────────────────────
  if (error === 'network') {
    return (
      <div style={styles.notFoundContainer}>
        <div style={styles.notFoundBox}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ ...styles.notFoundTitle, color: '#f59e0b' }}>Connexion impossible</h1>
          <p style={styles.notFoundText}>
            Vérifiez votre connexion internet et réessayez.
          </p>
          <button
            onClick={() => { setError(null); setLoading(true); checkSite() }}
            style={styles.notFoundButton}
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────
  // État 3 : Site en attente de création (PAS de spinner, PAS d'animation)
  // ──────────────────────────────────────────────
  if (!hasSite || loading) {
    return (
      <div style={styles.waitingContainer}>
        <div style={styles.waitingBox}>
          {/* Header avec nom du client */}
          <h1 style={styles.waitingTitle}>{client?.name || '...'}</h1>
          <p style={styles.waitingSubtitle}>
            {[client?.activity, client?.city].filter(Boolean).join(' • ') || ''}
          </p>

          {/* Card principale */}
          <div style={styles.waitingCard}>
            <div style={styles.waitingIcon}>🎨</div>
            <h2 style={styles.waitingCardTitle}>Votre site est en cours de création</h2>
            <p style={styles.waitingCardText}>
              Notre IA est en train de concevoir votre site web unique et professionnel.
              Cela prend généralement entre 1 et 3 minutes.
            </p>

            {/* Étapes */}
            <div style={styles.waitingSteps}>
              <div style={styles.stepDone}>✅ Informations enregistrées</div>
              <div style={styles.stepInProgress}>🔄 Design IA en cours...</div>
              <div style={styles.stepPending}>⏳ Publication imminente</div>
            </div>
          </div>

          {/* Info de rafraîchissement + compteur */}
          <p style={styles.waitingInfo}>
            {checkCount > 0
              ? `Vérification automatique toutes les 30 secondes (${checkCount} vérification${checkCount > 1 ? 's' : ''})`
              : 'Première vérification en cours...'}
          </p>

          {/* Bouton de vérification manuelle */}
          <button
            onClick={() => checkSite()}
            style={styles.refreshButton}
          >
            Vérifier maintenant ↻
          </button>

          {/* WhatsApp */}
          {client?.whatsapp && (
            <a
              href={`https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.whatsappButton}
            >
              💬 Nous contacter sur WhatsApp
            </a>
          )}
        </div>
      </div>
    )
  }

  // Extraire le body du HTML généré (l'IA génère souvent un document complet)
  const { body: siteBody, extraCss } = useMemo(() => {
    if (!site?.html) return { body: '', extraCss: '' }
    return extractBodyContent(site.html)
  }, [site?.html])

  // ──────────────────────────────────────────────
  // État 4 : Site prêt !
  // ──────────────────────────────────────────────
  if (hasSite && site) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: `${site.css || ''}\n${extraCss}` }} />
        <div dangerouslySetInnerHTML={{ __html: siteBody }} />
      </>
    )
  }

  return null
}

// ──────────────────────────────────────────────
// Styles inline (pas de dépendance Tailwind, pas de className, pas d'animation)
// ──────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  notFoundContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6',
    padding: '1rem',
  },
  notFoundBox: {
    textAlign: 'center' as const,
    padding: '2rem',
  },
  notFoundTitle: {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: '#ef4444',
  },
  notFoundText: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '2rem',
    lineHeight: 1.6,
  },
  notFoundButton: {
    display: 'inline-block',
    padding: '0.75rem 2rem',
    background: '#3b82f6',
    color: 'white',
    borderRadius: '12px',
    textDecoration: 'none' as const,
    fontWeight: 600,
    fontSize: '1rem',
    border: 'none' as const,
    cursor: 'pointer',
  },

  // Waiting page
  waitingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
    color: 'white',
  },
  waitingBox: {
    textAlign: 'center' as const,
    maxWidth: '440px',
    width: '100%',
  },
  waitingTitle: {
    fontSize: '1.8rem',
    marginBottom: '0.5rem',
    fontWeight: 700,
  },
  waitingSubtitle: {
    fontSize: '1.05rem',
    opacity: 0.9,
    marginBottom: '2rem',
  },
  waitingCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '2.5rem 2rem',
    marginBottom: '1.5rem',
    textAlign: 'left' as const,
  },
  waitingIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  waitingCardTitle: {
    fontSize: '1.15rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    textAlign: 'center' as const,
  },
  waitingCardText: {
    fontSize: '0.9rem',
    opacity: 0.85,
    lineHeight: 1.6,
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  waitingSteps: {
    fontSize: '0.85rem',
    opacity: 0.8,
  },
  stepDone: {
    padding: '0.4rem 0',
    opacity: 0.6,
    textDecoration: 'line-through' as const,
  },
  stepInProgress: {
    padding: '0.4rem 0',
    fontWeight: 600,
  },
  stepPending: {
    padding: '0.4rem 0',
    opacity: 0.6,
  },
  waitingInfo: {
    fontSize: '0.8rem',
    opacity: 0.6,
    marginBottom: '1rem',
  },
  refreshButton: {
    display: 'inline-block',
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    padding: '0.7rem 1.8rem',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 500,
    marginBottom: '1rem',
  },
  whatsappButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#25d366',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '50px',
    textDecoration: 'none' as const,
    fontWeight: 600,
    fontSize: '0.95rem',
  },
}
