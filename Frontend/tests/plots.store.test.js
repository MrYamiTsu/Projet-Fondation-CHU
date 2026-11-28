// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlotsStore } from '../src/stores/plots.js'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  localStorage.setItem('token', 'test-token')
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usePlotsStore.deletePlot', () => {
  it('accepte une réponse 204 sans corps (backend Express)', async () => {
    const store = usePlotsStore()
    store.plots = [{ id: 5 }, { id: 6 }]
    fetch.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(store.deletePlot(5)).resolves.toBe(true)
    expect(store.plots).toEqual([{ id: 6 }])
    expect(fetch.mock.calls[0][1].method).toBe('DELETE')
  })

  it('affiche le message d’erreur du serveur (409)', async () => {
    const store = usePlotsStore()
    store.plots = [{ id: 5 }]
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ erreur: 'Impossible de supprimer un emplacement qui a des réservations' }), {
        status: 409,
      }),
    )

    await expect(store.deletePlot(5)).rejects.toThrow('réservations')
    expect(store.plots).toEqual([{ id: 5 }])
  })
})
