import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { mockEtagesData } from '../data/mockEtages.js'

const rawApi = import.meta.env.VITE_API_URL ?? import.meta.env.API_BASE
const isDev = Boolean(import.meta.env.DEV)
const API_BASE = (rawApi && (!String(rawApi).includes('localhost') || isDev))
  ? String(rawApi).replace(/\/+$/, '')
  : (isDev ? 'http://localhost:3000' : '')

export const useEtagesStore = defineStore('etages', () => {
  const etages = ref([])
  const currentEtage = ref(null)
  const selectedPin = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchEtagesByHospital(hospitalCode) {
    if (!hospitalCode) {
      etages.value = []
      currentEtage.value = null
      selectedPin.value = null
      return []
    }

    loading.value = true
    error.value = null

    try {
      let data = null
      try {
        let res = await fetch(`${API_BASE}/api/etages?nom=${encodeURIComponent(hospitalCode)}`)
        if (!res.ok && res.status === 404) {
          res = await fetch(`${API_BASE}/etages?nom=${encodeURIComponent(hospitalCode)}`)
        }
        if (res.ok) {
          data = await res.json()
        }
      } catch {
        // Fallback en cas d'indisponibilité du serveur local
      }

      if (Array.isArray(data) && data.length > 0) {
        etages.value = data
      } else {
        // Utilisation des données de référence institutionnelles du CHU
        etages.value = mockEtagesData[hospitalCode] || []
      }

      if (etages.value.length > 0) {
        const rdc = etages.value.find((e) => Number(e.niveau) === 0)
        currentEtage.value = rdc || etages.value[0]
      } else {
        currentEtage.value = null
      }

      selectedPin.value = null
      return etages.value
    } catch (err) {
      error.value = err.message
      etages.value = mockEtagesData[hospitalCode] || []
      currentEtage.value = etages.value[0] || null
      return etages.value
    } finally {
      loading.value = false
    }
  }

  function selectEtage(etageId) {
    const found = etages.value.find((e) => e.id === etageId)
    if (found) {
      currentEtage.value = found
      selectedPin.value = null
    }
  }

  function selectPin(pin) {
    selectedPin.value = pin
  }

  function clearSelection() {
    selectedPin.value = null
  }

  return {
    etages,
    currentEtage,
    selectedPin,
    loading,
    error,
    fetchEtagesByHospital,
    selectEtage,
    selectPin,
    clearSelection,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEtagesStore, import.meta.hot))
}
