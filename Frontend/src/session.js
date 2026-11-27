// Réaction à l'expiration du jeton de connexion (JWT, valable 24 h).
// Quand le jeton expire — à l'heure prévue, ou parce qu'un appel authentifié
// renvoie 401 — on déconnecte l'utilisateur, on le prévient, et s'il est sur
// une page protégée on le renvoie à l'accueil avec la fenêtre de connexion ouverte.
import { watch } from 'vue'
import { useAuthStore } from './stores/auth.js'
import { useToastStore } from './stores/toast.js'

export const SESSION_EXPIRED_MESSAGE = 'Ta session a expiré. Reconnecte-toi.'
export const SESSION_EXPIRED_QUERY = { authModal: '1', reason: 'session_expired' }

// setTimeout ne gère pas les délais de plus de ~24,8 jours.
const DELAI_MAX = 2 ** 31 - 1

export function routeRequiresAuth(route) {
  return (
    route.path === '/admin' ||
    route.path.startsWith('/admin/') ||
    route.matched.some((r) => r.meta?.requiresAuth || r.meta?.requiresAdmin)
  )
}

function hasBearer(input, init) {
  const lire = (headers) => {
    if (!headers) return ''
    if (typeof headers.get === 'function') return headers.get('authorization') || ''
    return headers.Authorization || headers.authorization || ''
  }
  const valeur = lire(init?.headers) || lire(input?.headers)
  return String(valeur).startsWith('Bearer ')
}

export function installSessionExpiration(router, win = window) {
  const auth = useAuthStore()
  const toast = useToastStore()
  let timer = null

  function expire() {
    clearTimeout(timer)
    if (!auth.currentUser && !auth.token) return

    auth.logout()
    toast.show(SESSION_EXPIRED_MESSAGE)

    if (routeRequiresAuth(router.currentRoute.value)) {
      router.push({ path: '/', query: SESSION_EXPIRED_QUERY })
    }
  }

  function planifier() {
    clearTimeout(timer)
    const expiry = auth.tokenExpiry
    if (expiry === null) return

    const delai = expiry - Date.now()
    if (delai <= 0) {
      expire()
      return
    }
    timer = setTimeout(planifier, Math.min(delai, DELAI_MAX))
  }

  // Session déjà expirée au chargement de la page.
  if (auth.hasExpiredSession()) {
    expire()
  }

  watch(() => auth.token, planifier, { immediate: true })

  // Les minuteries sont ralenties quand l'onglet est en arrière-plan ou l'ordinateur en veille :
  // on revérifie au retour sur la page.
  win.document?.addEventListener('visibilitychange', () => {
    if (!win.document.hidden && auth.hasExpiredSession()) expire()
  })

  // Tout appel authentifié refusé (jeton expiré ou invalide) termine la session.
  const fetchOriginal = win.fetch.bind(win)
  win.fetch = async (input, init) => {
    const reponse = await fetchOriginal(input, init)
    if (reponse.status === 401 && auth.token && hasBearer(input, init)) {
      expire()
    }
    return reponse
  }

  return { expire }
}
