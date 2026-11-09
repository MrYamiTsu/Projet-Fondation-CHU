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

  async function getReservedPeriods(emplacementId) {
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
        .filter((reservation) => reservation.statut === 'confirmed')
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
      const response = await fetch(`${API_BASE}/reservations/confirmed`)
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

  return {
    reservations,
    reservedPeriods,
    allConfirmedReservations,
    loading,
    error,
    addReservation,
    getReservedPeriods,
    getAllConfirmedReservations,
    isEmplacementAvailable,
    formatDate,
  }
})
