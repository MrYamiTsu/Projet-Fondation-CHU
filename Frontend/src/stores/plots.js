import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, computed } from 'vue'

const rawApi = import.meta.env.VITE_API_URL ?? import.meta.env.API_BASE
const isDev = Boolean(import.meta.env.DEV)
const API_BASE = (rawApi && (!String(rawApi).includes('localhost') || isDev))
  ? String(rawApi).replace(/\/+$/, '')
  : (isDev ? 'http://localhost:3000' : '')
const API_URL = `${API_BASE}/api/emplacements`

export const usePlotsStore = defineStore('plots', () => {
  const plots = ref([])
  const plot = ref(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  function formatPrice(amount) {
    return `${new Intl.NumberFormat('fr-CA').format(amount)} $ CAD`
  }

  function formatPlot(p) {
    if (!p) return null
    const price = Number(p.valeur_toponymique ?? p.price ?? 0)
    return {
      ...p,
      id: Number(p.id),
      name: p.lieu_specifique || p.name || `Emplacement #${p.id}`,
      hospital: p.acronyme || p.hospital || 'CHUL',
      sector: p.type_lieu || p.sector || p.categorie || 'Général',
      price,
      formattedPrice: `${new Intl.NumberFormat('fr-CA').format(price)} $ CAD`,
      available: p.statut ? p.statut.toLowerCase() === 'disponible' : Boolean(p.available ?? true),
      image: p.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop',
      description: p.description || p.commentaire || 'Aucune description disponible pour cet emplacement.',
      dimensions: p.dimensions || (p.superficie ? `${p.superficie} m²` : '25 m²'),
      valeur15ans: p.valeur15ans || `${new Intl.NumberFormat('fr-CA').format(price * 1.5)} $ CAD`,
      achalandage: p.achalandage || (p.ff_id ? `Niveau d'achalandage ${p.ff_id}` : 'Élevé (~1 200 passages/jour)'),
    }
  }

  const totalPlots = computed(() => plots.value.length)
  const availablePlots = computed(() => plots.value.filter((p) => p.available).length)
  const reservedPlots = computed(() => plots.value.filter((p) => !p.available).length)
  const totalValuation = computed(() =>
    plots.value.reduce((acc, p) => acc + (Number(p.price) || 0), 0),
  )

  async function getPlots() {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      if (!res.ok) throw new Error(data.erreur || data.message || 'Erreur lors du chargement des emplacements')
      plots.value = data.map(formatPlot)
    } catch (error) {
      errorMessage.value = error.message
          } finally {
      isLoading.value = false
    }
  }

  async function getPlotById(id) {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await fetch(`${API_URL}/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.erreur || data.message || 'Emplacement introuvable')
      plot.value = formatPlot(data)
      return plot.value
    } catch (error) {
      errorMessage.value = error.message
      const existing = plots.value.find((p) => Number(p.id) === Number(id)) || null
      if (existing) {
        plot.value = existing
        return existing
      }
      plot.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function addPlot(plotData) {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(plotData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erreur || data.message || "Erreur lors de l'ajout")
      const newPlot = formatPlot(data.data?.emplacement || data)
      plots.value.unshift(newPlot)
      return newPlot
    } catch (error) {
      errorMessage.value = error.message
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updatePlot(id, updatedData) {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(updatedData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erreur || data.message || 'Erreur lors de la mise à jour')
      const updated = formatPlot(data.data?.emplacement || data)
      const index = plots.value.findIndex((p) => Number(p.id) === Number(id))
      if (index !== -1) plots.value[index] = updated
      return updated
    } catch (error) {
      errorMessage.value = error.message
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function toggleAvailability(id) {
    const item = plots.value.find((p) => Number(p.id) === Number(id))
    if (!item) return
    const newAvailable = !item.available
    const newStatut = newAvailable ? 'Disponible' : 'Réservé'
    await updatePlot(id, { ...item, available: newAvailable, statut: newStatut })
    return newAvailable
  }

  async function deletePlot(id) {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erreur || data.message || 'Erreur lors de la suppression')
      plots.value = plots.value.filter((p) => Number(p.id) !== Number(id))
      return true
    } catch (error) {
      errorMessage.value = error.message
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    plots,
    plot,
    isLoading,
    errorMessage,
    totalPlots,
    availablePlots,
    reservedPlots,
    totalValuation,
    formatPrice,
    getPlots,
    getPlotById,
    addPlot,
    updatePlot,
    toggleAvailability,
    deletePlot,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlotsStore, import.meta.hot))
}
