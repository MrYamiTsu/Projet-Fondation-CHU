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
  const allConfirmedReservations = ref([])
  const myReservations = ref([])
  const pendingReservations = ref([]) 
  const pendingLoading = ref(false) 
  const pendingError = ref(null) 
  const confirmingReservationId = ref(null)
  const allReservations = ref([]) 
  const allLoading = ref(false)
  const allError = ref(null)
  const processingReservationId = ref(null) 
  const processingAction = ref(null) 
  function formatDate(d) {
    if (!d) return ''
    const date = new Date(d)
    if (isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  async function addReservation(emplacementId, dateDebut, dateFin) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Utilisateur non authentifié')
      }

      const response = await fetch(`${API_BASE}/api/reservations`, {
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

      const response = await fetch(`${API_BASE}/api/reservations/me`, {
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

      const response = await fetch(`${API_BASE}/api/reservations/emplacement/${emplacementId}`, {
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
            reservation.statut === 'confirmed' &&
            (excludedReservationId === null ||
              Number(reservation.id) !== Number(excludedReservationId)),
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

  async function getAllConfirmedReservations() {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE}/api/reservations/confirmed`)
      if (!response.ok) return []
      const result = await response.json()
      const list = result.data?.reservations || []
      allConfirmedReservations.value = list.map((reservation) => ({
        id: reservation.id,
        emplacement_id: Number(reservation.emplacement_id),
        start: String(reservation.date_debut).slice(0, 10),
        end: String(reservation.date_fin).slice(0, 10),
      }))
      return allConfirmedReservations.value
    } catch {
      return []
    } finally {
      loading.value = false
    }
  }

  function isEmplacementAvailable(emplacementId, startDate, endDate) {
    if (!startDate || !endDate) return true
    const startStr = typeof startDate === 'string' ? startDate.slice(0, 10) : formatDate(startDate)
    const endStr = typeof endDate === 'string' ? endDate.slice(0, 10) : formatDate(endDate)
    if (!startStr || !endStr) return true

    const relevant =
      allConfirmedReservations.value.length > 0
        ? allConfirmedReservations.value.filter(
            (r) => Number(r.emplacement_id) === Number(emplacementId),
          )
        : reservedPeriods.value

    return !relevant.some((r) => {
      return r.start <= endStr && r.end >= startStr
    })
  }

  async function updateMyReservation(id, dateDebut, dateFin) {
    const token = localStorage.getItem('token')

    if (!token) {
      throw new Error('Utilisateur non authentifié')
    }

    const response = await fetch(`${API_BASE}/api/reservations/me/${id}`, {
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

    const response = await fetch(`${API_BASE}/api/reservations/me/${id}/cancel`, {
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
  async function requestAdminReservation(path, options = {}) {
    const token = localStorage.getItem('token')

    if (!token) {
      throw new Error('Connecte-toi avec un compte administrateur.')
    }

    let response

    try {
      response = await fetch(`${API_BASE}/api/reservations${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch {
      throw new Error('Impossible de contacter le serveur backend.')
    }

    const result = await response.json().catch(() => null)

    if (response.status === 401) {
      throw new Error('Ta session a expiré. Reconnecte-toi.')
    }

    if (response.status === 403) {
      throw new Error('Cette action est réservée aux administrateurs.')
    }

    if (!response.ok) {
      throw new Error(
        result?.message || result?.erreur || result?.error || `Erreur HTTP ${response.status}`,
      )
    }

    if (!result?.data) {
      throw new Error('Réponse du serveur invalide.')
    }

    return result.data
  }
  async function fetchPendingReservations() {
    pendingLoading.value = true
    pendingError.value = null
    pendingReservations.value = []

    try {
      const data = await requestAdminReservation('/status?status=pending')

      if (!Array.isArray(data.reservations)) {
        throw new Error('Format des réservations invalide.')
      }

      pendingReservations.value = data.reservations.filter(
        (reservation) => reservation.statut === 'pending',
      )

      return pendingReservations.value
    } catch (err) {
      pendingError.value = err.message
      throw err
    } finally {
      pendingLoading.value = false
    }
  }
  async function confirmPendingReservation(id) {
    if (confirmingReservationId.value !== null) {
      throw new Error('Une confirmation est déjà en cours.')
    }

    confirmingReservationId.value = id
    pendingError.value = null

    try {
      const { reservation } = await requestAdminReservation(`/${encodeURIComponent(id)}/confirm`, {
        method: 'PATCH',
      })

      if (
        !reservation ||
        String(reservation.id) !== String(id) ||
        reservation.statut !== 'confirmed'
      ) {
        throw new Error('La confirmation retournée par le serveur est invalide.')
      }

      pendingReservations.value = pendingReservations.value.filter(
        (item) => String(item.id) !== String(id),
      )

      for (const list of [reservations, myReservations]) {
        const index = list.value.findIndex((item) => String(item.id) === String(id))

        if (index !== -1) {
          list.value[index] = {
            ...list.value[index],
            ...reservation,
          }
        }
      }

      return reservation
    } catch (err) {
      pendingError.value = err.message
      throw err
    } finally {
      confirmingReservationId.value = null
    }
  }
  async function fetchAllReservations() {
    allLoading.value = true
    allError.value = null

    try {
      const data = await requestAdminReservation('')

      if (!Array.isArray(data.reservations)) {
        throw new Error('Format des réservations invalide.')
      }

      allReservations.value = data.reservations
      return allReservations.value
    } catch (err) {
      allError.value = err.message
      allReservations.value = []
      throw err
    } finally {
      allLoading.value = false
    }
  }

  // Confirmation ou annulation d'une réservation par un administrateur.
  async function processReservationAsAdmin(id, action) {
    if (processingReservationId.value !== null) {
      throw new Error('Une action est déjà en cours.')
    }

    processingReservationId.value = id
    processingAction.value = action
    allError.value = null

    try {
      const { reservation } = await requestAdminReservation(
        `/${encodeURIComponent(id)}/${action}`,
        { method: 'PATCH' },
      )

      if (!reservation || String(reservation.id) !== String(id)) {
        throw new Error('La réponse du serveur est invalide.')
      }

      // Le statut a changé : la réservation n'est plus « en attente ».
      pendingReservations.value = pendingReservations.value.filter(
        (item) => String(item.id) !== String(id),
      )

      for (const list of [allReservations, reservations, myReservations]) {
        const index = list.value.findIndex((item) => String(item.id) === String(id))

        if (index !== -1) {
          list.value[index] = {
            ...list.value[index],
            ...reservation,
          }
        }
      }

      return reservation
    } catch (err) {
      allError.value = err.message
      throw err
    } finally {
      processingReservationId.value = null
      processingAction.value = null
    }
  }

  const confirmReservationAsAdmin = (id) => processReservationAsAdmin(id, 'confirm')
  const cancelReservationAsAdmin = (id) => processReservationAsAdmin(id, 'cancel')

 return {
  reservations,
  reservedPeriods,
  allConfirmedReservations,
  myReservations,
  loading,
  error,

  pendingReservations,
  pendingLoading,
  pendingError,
  confirmingReservationId,

  allReservations,
  allLoading,
  allError,
  processingReservationId,
  processingAction,

  addReservation,
  fetchMyReservations,
  getReservedPeriods,
  getAllConfirmedReservations,
  isEmplacementAvailable,
  updateMyReservation,
  cancelMyReservation,
  formatDate,
  fetchPendingReservations,
  confirmPendingReservation,
  fetchAllReservations,
  confirmReservationAsAdmin,
  cancelReservationAsAdmin,
}
})
