// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useAuthStore, getTokenExpiry, isTokenExpired } from '../src/stores/auth.js'
import { useToastStore } from '../src/stores/toast.js'
import {
  installSessionExpiration,
  SESSION_EXPIRED_MESSAGE,
  SESSION_EXPIRED_QUERY,
} from '../src/session.js'

function fakeJwt(expSeconds) {
  const b64 = (o) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${b64({ alg: 'HS256' })}.${b64({ id: 1, role: 'user', exp: expSeconds })}.signature`
}

const USER = { id: 1, name: 'Test', email: 't@t.ca', role: 'user' }
const Vide = { template: '<div />' }

function creerRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Vide },
      { path: '/emplacement/:id', component: Vide },
      { path: '/mes-reservations', component: Vide, meta: { requiresAuth: true } },
    ],
  })
}

function seConnecter(token) {
  localStorage.setItem('token', token)
  localStorage.setItem('chu_current_user', JSON.stringify(USER))
}

let fakeWindow

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-26T12:00:00Z'))
  fakeWindow = {
    fetch: vi.fn(async () => new Response('{}', { status: 200 })),
    document: { hidden: false, addEventListener: vi.fn() },
  }
})

afterEach(() => {
  vi.useRealTimers()
})

const maintenant = () => Math.floor(Date.now() / 1000)

describe('décodage du jeton', () => {
  it('lit la date d’expiration', () => {
    expect(getTokenExpiry(fakeJwt(1800000000))).toBe(1800000000 * 1000)
  })

  it('renvoie null pour un jeton illisible (pas de déconnexion à l’aveugle)', () => {
    expect(getTokenExpiry('test-token')).toBeNull()
    expect(isTokenExpired('test-token')).toBe(false)
  })
})

describe('installSessionExpiration', () => {
  it('déconnecte au chargement si le jeton est déjà expiré', async () => {
    seConnecter(fakeJwt(maintenant() - 60))
    const router = creerRouter()
    await router.push('/')

    installSessionExpiration(router, fakeWindow)

    const auth = useAuthStore()
    expect(auth.currentUser).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(useToastStore().message).toBe(SESSION_EXPIRED_MESSAGE)
  })

  it('déconnecte à l’heure d’expiration et renvoie vers la connexion depuis une page protégée', async () => {
    seConnecter(fakeJwt(maintenant() + 3600))
    const router = creerRouter()
    await router.push('/mes-reservations')

    installSessionExpiration(router, fakeWindow)
    const auth = useAuthStore()
    expect(auth.currentUser).not.toBeNull()

    vi.advanceTimersByTime(3600 * 1000 - 1000)
    expect(auth.currentUser).not.toBeNull()

    vi.advanceTimersByTime(2000)
    await vi.runAllTimersAsync()
    expect(auth.currentUser).toBeNull()
    expect(router.currentRoute.value.path).toBe('/')
    expect(router.currentRoute.value.query).toEqual(SESSION_EXPIRED_QUERY)
  })

  it('reste sur une page publique quand la session expire', async () => {
    seConnecter(fakeJwt(maintenant() + 10))
    const router = creerRouter()
    await router.push('/emplacement/3')

    installSessionExpiration(router, fakeWindow)
    vi.advanceTimersByTime(11000)

    expect(useAuthStore().currentUser).toBeNull()
    expect(useToastStore().message).toBe(SESSION_EXPIRED_MESSAGE)
    await vi.runAllTimersAsync()
    expect(router.currentRoute.value.path).toBe('/emplacement/3')
  })

  it('déconnecte quand un appel authentifié renvoie 401', async () => {
    seConnecter(fakeJwt(maintenant() + 3600))
    const router = creerRouter()
    await router.push('/mes-reservations')
    fakeWindow.fetch.mockResolvedValueOnce(new Response('{}', { status: 401 }))

    installSessionExpiration(router, fakeWindow)
    const reponse = await fakeWindow.fetch('/api/reservations/me', {
      headers: { Authorization: 'Bearer abc' },
    })
    await nextTick()

    expect(reponse.status).toBe(401)
    expect(useAuthStore().currentUser).toBeNull()
    await vi.runAllTimersAsync()
    expect(router.currentRoute.value.query).toEqual(SESSION_EXPIRED_QUERY)
  })

  it('ignore un 401 sans jeton (ex. mauvais mot de passe à la connexion)', async () => {
    seConnecter(fakeJwt(maintenant() + 3600))
    const router = creerRouter()
    await router.push('/')
    fakeWindow.fetch.mockResolvedValueOnce(new Response('{}', { status: 401 }))

    installSessionExpiration(router, fakeWindow)
    await fakeWindow.fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' } })

    expect(useAuthStore().currentUser).not.toBeNull()
  })

  it('revérifie au retour sur l’onglet', async () => {
    seConnecter(fakeJwt(maintenant() + 10))
    const router = creerRouter()
    await router.push('/')
    installSessionExpiration(router, fakeWindow)

    vi.setSystemTime(new Date(Date.now() + 60_000))
    const [evenement, rappel] = fakeWindow.document.addEventListener.mock.calls[0]
    expect(evenement).toBe('visibilitychange')
    rappel()

    expect(useAuthStore().currentUser).toBeNull()
  })

  it('replanifie après une nouvelle connexion', async () => {
    const router = creerRouter()
    await router.push('/')
    installSessionExpiration(router, fakeWindow)
    const auth = useAuthStore()

    auth.currentUser = USER
    auth.token = fakeJwt(maintenant() + 5)
    await nextTick()

    vi.advanceTimersByTime(6000)
    await vi.runAllTimersAsync()
    expect(auth.currentUser).toBeNull()
  })
})
