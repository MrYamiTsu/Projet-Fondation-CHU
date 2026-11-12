import { defineStore } from 'pinia'
import { ref } from 'vue'

const rawApi = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE
const isDev = Boolean(import.meta.env.DEV)

const API_BASE =
  rawApi && (!String(rawApi).includes('localhost') || isDev)
    ? String(rawApi).replace(/\/+$/, '')
    : isDev
      ? 'http://localhost:3000'
      : ''

export const useReservationStore = defineStore('reservations', () => {
  const reservations = ref([])
  const loading = ref(false)
  const error = ref(null)
  const reservedPeriods = ref([])
  const myReservations = ref([])
  async function addReservation(emplacementId, dateDebut, dateFin) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Utilisateur non authentifié')
      }

      const response = await fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emplacementId,
          dateDebut,
          dateFin,
        }),
      })

      const result = await response.json()

      console.log('POST /reservations :', response.status, result)

      if (!response.ok) {
        throw new Error(
          result.message || result.erreur || result.error || `Erreur HTTP ${response.status}`,
        )
      }

      const reservation = result.data.reservation

      reservations.value.push(reservation)

      return reservation
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMyReservations() {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Utilisateur non authentifié')
      }

      const response = await fetch(`${API_BASE}/reservations/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || result.erreur || 'Erreur de chargement')
      }

      myReservations.value = result.data.reservations
      return myReservations.value
    } catch (err) {
      error.value = err.message
      myReservations.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getReservedPeriods(emplacementId, excludedReservationId = null) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Utilisateur non authentifié')
      }

      const response = await fetch(`${API_BASE}/reservations/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || result.erreur || 'Erreur de chargement')
      }

      myReservations.value = result.data.reservations
      return myReservations.value
    } catch (err) {
      error.value = err.message
      myReservations.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getReservedPeriods(emplacementId, excludedReservationId = null) {
    loading.value = true
    error.value = null
    reservedPeriods.value = []

    try {
      const token = localStorage.getItem('token')
      const headers = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}/reservations/emplacement/${emplacementId}`, {
        method: 'GET',
        headers,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Impossible de récupérer les réservations')
      }

      const emplacementReservations = result.data.reservations

      if (!Array.isArray(emplacementReservations)) {
        throw new Error('Format des réservations invalide')
      }

      reservedPeriods.value = emplacementReservations
        .filter(
          (reservation) =>
            ['pending', 'confirmed'].includes(reservation.statut) &&
            Number(reservation.id) !== Number(excludedReservationId),
        )
        .map((reservation) => ({
          start: String(reservation.date_debut).slice(0, 10),
          end: String(reservation.date_fin).slice(0, 10),
        }))

      return reservedPeriods.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateMyReservation(id, dateDebut, dateFin) {
    const token = localStorage.getItem('token')

    if (!token) {
      throw new Error('Utilisateur non authentifié')
    }

    const response = await fetch(`${API_BASE}/reservations/me/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dateDebut, dateFin }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || result.erreur || 'Impossible de modifier la réservation')
    }

    const updatedReservation = result.data.reservation

    const index = myReservations.value.findIndex(
      (reservation) => Number(reservation.id) === Number(id),
    )

    if (index !== -1) {
      myReservations.value[index] = {
        ...myReservations.value[index],
        ...updatedReservation,
      }
    }

    return updatedReservation
  }

  async function cancelMyReservation(id) {
    const token = localStorage.getItem('token')

    if (!token) throw new Error('Utilisateur non authentifié')

    const response = await fetch(`${API_BASE}/reservations/me/${id}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Impossible d'annuler la réservation")
    }

    await fetchMyReservations()
    return result.data.reservation
  }

  return {
    reservations,
    reservedPeriods,
    allConfirmedReservations,
    myReservations,
    loading,
    error,
    addReservation,
    fetchMyReservations,
    getReservedPeriods,
    myReservations,
    fetchMyReservations,
    cancelMyReservation,
    updateMyReservation,
  }
})
