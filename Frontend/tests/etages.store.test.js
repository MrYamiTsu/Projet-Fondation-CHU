// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useEtagesStore } from '../src/stores/etages.js'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  localStorage.setItem('token', 'test-jwt-token')
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Store des étages (useEtagesStore)', () => {
  it('téléverse une nouvelle image d\'étage avec succès', async () => {
    const store = useEtagesStore()
    store.etages = [
      { id: 1, nom: 'RDC', image_url: null, image_public_id: null },
      { id: 2, nom: '2e', image_url: null, image_public_id: null },
    ]
    store.currentEtage = store.etages[0]

    const mockResponse = {
      id: 1,
      nom: 'RDC',
      image_url: 'https://res.cloudinary.com/demo/image/upload/v1/etages/plan1.png',
      image_public_id: 'etages/plan1',
    }

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    })

    const file = new File(['fake-content'], 'plan.png', { type: 'image/png' })
    const result = await store.uploadEtageImage(1, file)

    expect(fetch).toHaveBeenCalled()
    const callArgs = fetch.mock.calls[0]
    expect(callArgs[0]).toContain('/etages/1/image')
    expect(callArgs[1].method).toBe('PUT')
    expect(callArgs[1].headers['Authorization']).toBe('Bearer test-jwt-token')
    expect(callArgs[1].body).toBeInstanceOf(FormData)

    expect(result.image_url).toBe(mockResponse.image_url)
    expect(store.currentEtage.image_url).toBe(mockResponse.image_url)
    expect(store.etages[0].image_url).toBe(mockResponse.image_url)
  })

  it('lève une erreur si le backend retourne une erreur HTTP', async () => {
    const store = useEtagesStore()

    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "L'image ne doit pas dépasser 5 Mo" }),
    })

    const file = new File(['content'], 'plan.png', { type: 'image/png' })
    await expect(store.uploadEtageImage(1, file)).rejects.toThrow("L'image ne doit pas dépasser 5 Mo")
  })

  it('supprime l\'image d\'un étage avec succès', async () => {
    const store = useEtagesStore()
    store.etages = [
      { id: 1, nom: 'RDC', image_url: 'https://example.com/plan.png', image_public_id: 'etages/123', pins: [{ id: 10 }] },
    ]
    store.currentEtage = store.etages[0]

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, image_url: null, image_public_id: null }),
    })

    await store.deleteEtageImage(1)

    expect(fetch).toHaveBeenCalled()
    const callArgs = fetch.mock.calls[0]
    expect(callArgs[0]).toContain('/etages/1/image')
    expect(callArgs[1].method).toBe('DELETE')

    expect(store.currentEtage.image_url).toBeNull()
    expect(store.currentEtage.pins).toEqual([])
    expect(store.etages[0].image_url).toBeNull()
  })

  it('crée un pin avec succès et l\'ajoute au currentEtage', async () => {
    const store = useEtagesStore()
    store.etages = [{ id: 1, nom: 'RDC', pins: [] }]
    store.currentEtage = store.etages[0]

    const mockPin = {
      id: 99,
      hopital_id: 1,
      etage_id: 1,
      emplacement_id: 10,
      x: 0.35,
      y: 0.45,
      no_local_pavillon: 'CHUL-RC-001',
      lieu_specifique: 'Hall',
    }

    fetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockPin,
    })

    const result = await store.createPin(1, 10, 0.35, 0.45)

    expect(fetch).toHaveBeenCalled()
    const callArgs = fetch.mock.calls[0]
    expect(callArgs[0]).toContain('/pins')
    expect(callArgs[1].method).toBe('POST')
    expect(JSON.parse(callArgs[1].body)).toEqual({
      etage_id: 1,
      emplacement_id: 10,
      x: 0.35,
      y: 0.45,
    })

    expect(result.id).toBe(99)
    expect(store.currentEtage.pins).toHaveLength(1)
    expect(store.currentEtage.pins[0].id).toBe(99)
    expect(store.etages[0].pins[0].id).toBe(99)
  })

  it('supprime un pin avec succès et retire du currentEtage', async () => {
    const store = useEtagesStore()
    store.etages = [
      {
        id: 1,
        nom: 'RDC',
        pins: [
          { id: 99, emplacement_id: 10 },
          { id: 100, emplacement_id: 11 },
        ],
      },
    ]
    store.currentEtage = store.etages[0]
    store.selectedPin = store.currentEtage.pins[0]

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 99 }),
    })

    await store.deletePin(99)

    expect(fetch).toHaveBeenCalled()
    const callArgs = fetch.mock.calls[0]
    expect(callArgs[0]).toContain('/pins/99')
    expect(callArgs[1].method).toBe('DELETE')

    expect(store.currentEtage.pins).toHaveLength(1)
    expect(store.currentEtage.pins[0].id).toBe(100)
    expect(store.selectedPin).toBeNull()
  })
})
