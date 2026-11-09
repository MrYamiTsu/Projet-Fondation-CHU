
// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useReservationStore } from '../src/stores/reservations.js'

beforeEach(() => {
  setActivePinia(createPinia())

  localStorage.clear()
  localStorage.setItem('token', 'test-token')

  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Store des réservations', () => {

  it('récupère uniquement les périodes confirmées', async () => {
    const store = useReservationStore()

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          reservations: [
            {
              statut: 'confirmed',
              date_debut: '2026-11-10',
              date_fin: '2026-11-15'
            },
            {
              statut: 'pending',
              date_debut: '2026-11-20',
              date_fin: '2026-11-25'
            }
          ]
        }
      })
    })

    await store.getReservedPeriods(3)

    expect(store.reservedPeriods).toEqual([
      {
        start: '2026-11-10',
        end: '2026-11-15'
      }
    ])

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/reservations/emplacement/3'),
      expect.any(Object)
    )
  })

  it('crée une réservation avec les bonnes données', async () => {
    const store = useReservationStore()

    const reservation = {
      id: 1,
      emplacement_id: 3,
      statut: 'pending'
    }

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { reservation }
      })
    })

    await store.addReservation(
      3,
      '2026-11-16',
      '2026-11-20'
    )

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/reservations'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        }),
        body: JSON.stringify({
          emplacementId: 3,
          dateDebut: '2026-11-16',
          dateFin: '2026-11-20'
        })
      })
    )

    expect(store.reservations).toContainEqual(reservation)
  })

  it('refuse une réservation lorsque le backend retourne 409', async () => {
    const store = useReservationStore()

    fetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Cet emplacement est déjà réservé pour cette période'
      })
    })

    await expect(
      store.addReservation(3, '2026-11-10', '2026-11-15')
    ).rejects.toThrow(
      'Cet emplacement est déjà réservé pour cette période'
    )

    expect(store.error).toBe(
      'Cet emplacement est déjà réservé pour cette période'
    )

    expect(store.reservations).toHaveLength(0)
  })

  it('permet de récupérer les réservations même sans token utilisateur', async () => {
    localStorage.clear()
    const store = useReservationStore()

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          reservations: [
            {
              statut: 'confirmed',
              date_debut: '2026-12-01',
              date_fin: '2026-12-05'
            }
          ]
        }
      })
    })

    await store.getReservedPeriods(5)
    expect(store.reservedPeriods).toEqual([
      { start: '2026-12-01', end: '2026-12-05' }
    ])
  })

  it('vérifie la disponibilité d’un emplacement pour une période donnée', async () => {
    const store = useReservationStore()
    store.allConfirmedReservations = [
      { id: 1, emplacement_id: 3, start: '2026-11-10', end: '2026-11-15' }
    ]

    expect(store.isEmplacementAvailable(3, '2026-11-12', '2026-11-18')).toBe(false)
    expect(store.isEmplacementAvailable(3, '2026-11-05', '2026-11-10')).toBe(false)
    expect(store.isEmplacementAvailable(3, '2026-11-16', '2026-11-20')).toBe(true)
    expect(store.isEmplacementAvailable(4, '2026-11-10', '2026-11-15')).toBe(true)
  })

})
