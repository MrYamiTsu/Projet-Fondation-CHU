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

  async function uploadEtageImage(etageId, file) {
    if (!etageId || !file) {
      throw new Error('Identifiant d\'étage et fichier image requis')
    }

    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('image', file)

      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      let res = await fetch(`${API_BASE}/api/etages/${etageId}/image`, {
        method: 'PUT',
        headers,
        body: formData,
      })

      if (!res.ok && res.status === 404) {
        res = await fetch(`${API_BASE}/etages/${etageId}/image`, {
          method: 'PUT',
          headers,
          body: formData,
        })
      }

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erreur lors du téléversement de l\'image')
      }

      const index = etages.value.findIndex((e) => Number(e.id) === Number(etageId))
      if (index !== -1) {
        etages.value[index] = { ...etages.value[index], ...data }
      }

      if (currentEtage.value && Number(currentEtage.value.id) === Number(etageId)) {
        currentEtage.value = { ...currentEtage.value, ...data }
      }

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEtageImage(etageId) {
    if (!etageId) {
      throw new Error('Identifiant d\'étage requis')
    }

    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('token')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      let res = await fetch(`${API_BASE}/api/etages/${etageId}/image`, {
        method: 'DELETE',
        headers,
      })

      if (!res.ok && res.status === 404) {
        res = await fetch(`${API_BASE}/etages/${etageId}/image`, {
          method: 'DELETE',
          headers,
        })
      }

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de la suppression de l\'image')
      }

      const index = etages.value.findIndex((e) => Number(e.id) === Number(etageId))
      if (index !== -1) {
        etages.value[index] = {
          ...etages.value[index],
          image_url: null,
          image_public_id: null,
          pins: [],
        }
      }

      if (currentEtage.value && Number(currentEtage.value.id) === Number(etageId)) {
        currentEtage.value = {
          ...currentEtage.value,
          image_url: null,
          image_public_id: null,
          pins: [],
        }
      }

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPin(etageId, emplacementId, x, y) {
    if (!etageId || !emplacementId || x === undefined || y === undefined) {
      throw new Error('Données du pin incomplètes')
    }

    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      let res = await fetch(`${API_BASE}/api/pins`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          etage_id: Number(etageId),
          emplacement_id: Number(emplacementId),
          x: Number(x),
          y: Number(y),
        }),
      })

      if (!res.ok && res.status === 404) {
        res = await fetch(`${API_BASE}/pins`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            etage_id: Number(etageId),
            emplacement_id: Number(emplacementId),
            x: Number(x),
            y: Number(y),
          }),
        })
      }

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erreur lors du placement du pin')
      }

      // Si cet emplacement était déjà placé sur un étage, le retirer de son ancienne position
      for (const etage of etages.value) {
        if (Array.isArray(etage.pins)) {
          etage.pins = etage.pins.filter(
            (p) => Number(p.emplacement_id) !== Number(emplacementId),
          )
        }
      }

      if (currentEtage.value) {
        if (!Array.isArray(currentEtage.value.pins)) {
          currentEtage.value.pins = []
        }
        currentEtage.value.pins = currentEtage.value.pins.filter(
          (p) => Number(p.emplacement_id) !== Number(emplacementId),
        )
        if (Number(currentEtage.value.id) === Number(etageId)) {
          currentEtage.value.pins.push(data)
        }
      }

      const etage = etages.value.find((e) => Number(e.id) === Number(etageId))
      if (etage) {
        if (!Array.isArray(etage.pins)) {
          etage.pins = []
        }
        if (!etage.pins.some((p) => Number(p.id) === Number(data.id))) {
          etage.pins.push(data)
        }
      }

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deletePin(pinId) {
    if (!pinId) {
      throw new Error('Identifiant de pin requis')
    }

    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('token')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      let res = await fetch(`${API_BASE}/api/pins/${pinId}`, {
        method: 'DELETE',
        headers,
      })

      if (!res.ok && res.status === 404) {
        res = await fetch(`${API_BASE}/pins/${pinId}`, {
          method: 'DELETE',
          headers,
        })
      }

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de la suppression du pin')
      }

      if (currentEtage.value && Array.isArray(currentEtage.value.pins)) {
        currentEtage.value.pins = currentEtage.value.pins.filter(
          (p) => Number(p.id) !== Number(pinId),
        )
      }

      for (const etage of etages.value) {
        if (Array.isArray(etage.pins)) {
          etage.pins = etage.pins.filter((p) => Number(p.id) !== Number(pinId))
        }
      }

      if (selectedPin.value && Number(selectedPin.value.id) === Number(pinId)) {
        selectedPin.value = null
      }

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
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
    uploadEtageImage,
    deleteEtageImage,
    createPin,
    deletePin,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEtagesStore, import.meta.hot))
}
