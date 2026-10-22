import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, computed } from 'vue'
import { mockPlots as initialMockPlots } from '../data/mockData.js'

const API_BASE = 'http://localhost:3000'
const API_URL = `${API_BASE}/emplacements`

export const usePlotsStore = defineStore('plots', () => {
  const plots = ref([])
  const plot = ref(null)
  const isLoading = ref(false)
  const isDbConnected = ref(false)
  const errorMessage = ref('')

  function formatPrice(amount) {
    return `${new Intl.NumberFormat('fr-CA').format(amount)} $ CAD`
  }

  // Normalise un emplacement provenant soit de PostgreSQL, soit du mock, soit du localStorage
  function normalizePlot(raw) {
    if (!raw) return null

    const id = Number(raw.id)
    const price = Number(
      raw.valeur_toponymique !== undefined ? raw.valeur_toponymique : raw.price || 0,
    )
    const hospital = raw.acronyme || raw.hospital || 'CHUL'
    const name = raw.lieu_specifique || raw.name || `Emplacement #${id}`
    const sector = raw.type_lieu || raw.sector || raw.categorie || 'Général'
    const available = raw.statut
      ? raw.statut.toLowerCase() === 'disponible'
      : raw.available !== undefined
        ? Boolean(raw.available)
        : true

    const defaultImages = {
      CHUL: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop',
      HEJ: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop',
      HDQ: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop',
      HSFA: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop',
      HSS: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&auto=format&fit=crop',
      NCH: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop',
      CRCE: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop',
    }

    return {
      ...raw,
      id,
      name,
      hospital,
      sector,
      price,
      formattedPrice: raw.formattedPrice || formatPrice(price),
      available,
      image:
        raw.image || defaultImages[hospital] || defaultImages.CHUL,
      description: raw.description || raw.commentaire || 'Aucune description disponible pour cet emplacement.',
      dimensions: raw.dimensions || (raw.superficie ? `${raw.superficie} m²` : '25 m²'),
      valeur15ans: raw.valeur15ans || formatPrice(price * 1.5),
      achalandage: raw.achalandage || (raw.ff_id ? `Niveau d'achalandage ${raw.ff_id}` : 'Élevé (~1 200 passages/jour)'),
    }
  }

  // Chargement initial avec fallback
  const loadInitialPlots = () => {
    try {
      const saved = localStorage.getItem('chu_plots')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizePlot)
        }
      }
    } catch (e) {
      console.warn('Erreur lecture localStorage:', e)
    }
    return initialMockPlots.map(normalizePlot)
  }

  plots.value = loadInitialPlots()

  function persist() {
    try {
      localStorage.setItem('chu_plots', JSON.stringify(plots.value))
    } catch (e) {
      console.error('Erreur sauvegarde localStorage:', e)
    }
  }

  const totalPlots = computed(() => plots.value.length)
  const availablePlots = computed(() => plots.value.filter((p) => p.available).length)
  const reservedPlots = computed(() => plots.value.filter((p) => !p.available).length)
  const totalValuation = computed(() =>
    plots.value.reduce((acc, p) => acc + (Number(p.price) || 0), 0),
  )

  function getPlotById(id) {
    return plots.value.find((p) => Number(p.id) === Number(id)) || null
  }

  async function getPlots() {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3500)

      const res = await fetch(API_URL, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`)
      }

      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        plots.value = data.map(normalizePlot)
        isDbConnected.value = true
        persist()
      } else if (Array.isArray(data) && data.length === 0) {
        isDbConnected.value = true
      }
    } catch (error) {
      isDbConnected.value = false
      errorMessage.value = error.message
      // En cas de non-disponibilité de la BD locale, on garantit que l'interface a des données
      if (plots.value.length === 0) {
        plots.value = initialMockPlots.map(normalizePlot)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function RechercherPlots(lieu) {
    if (!lieu) return getPlots()
    isLoading.value = true
    errorMessage.value = ''
    try {
      const res = await fetch(`${API_URL}/recherche?lieu=${encodeURIComponent(lieu)}`)
      if (!res.ok) throw new Error('Erreur lors de la recherche')
      const data = await res.json()
      if (Array.isArray(data)) {
        plots.value = data.map(normalizePlot)
      }
    } catch (error) {
      errorMessage.value = error.message
    } finally {
      isLoading.value = false
    }
  }

  async function addPlot(plotData) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(plotData),
      })
      if (res.ok) {
        const data = await res.json()
        const newPlot = normalizePlot(data.data?.emplacement || data)
        plots.value.unshift(newPlot)
        persist()
        return newPlot
      }
    } catch (e) {
      console.warn('Mode local/hors-ligne pour addPlot:', e)
    }

    const nextId = plots.value.length > 0 ? Math.max(...plots.value.map((p) => p.id)) + 1 : 1
    const newPlot = normalizePlot({
      ...plotData,
      id: nextId,
    })
    plots.value.unshift(newPlot)
    persist()
    return newPlot
  }

  async function updatePlot(id, updatedData) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(updatedData),
      })
      if (res.ok) {
        const data = await res.json()
        const updated = normalizePlot(data.data?.emplacement || data)
        const index = plots.value.findIndex((p) => Number(p.id) === Number(id))
        if (index !== -1) {
          plots.value[index] = updated
          persist()
        }
        return updated
      }
    } catch (e) {
      console.warn('Mode local/hors-ligne pour updatePlot:', e)
    }

    const index = plots.value.findIndex((p) => Number(p.id) === Number(id))
    if (index !== -1) {
      plots.value[index] = normalizePlot({
        ...plots.value[index],
        ...updatedData,
        id: Number(id),
      })
      persist()
      return plots.value[index]
    }
    return null
  }

  function toggleAvailability(id) {
    const item = plots.value.find((p) => Number(p.id) === Number(id))
    if (!item) return null
    item.available = !item.available
    item.statut = item.available ? 'Disponible' : 'Réservé'
    persist()
    updatePlot(id, { ...item, available: item.available, statut: item.statut }).catch(() => {})
    return item.available
  }

  function deletePlot(id) {
    const beforeCount = plots.value.length
    plots.value = plots.value.filter((p) => Number(p.id) !== Number(id))
    if (plots.value.length !== beforeCount) {
      persist()
      fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      }).catch(() => {})
      return true
    }
    return false
  }

  function resetToDefault() {
    plots.value = initialMockPlots.map(normalizePlot)
    persist()
    getPlots()
  }

  return {
    plots,
    plot,
    isLoading,
    isDbConnected,
    errorMessage,
    totalPlots,
    availablePlots,
    reservedPlots,
    totalValuation,
    formatPrice,
    normalizePlot,
    getPlots,
    getPlotById,
    RechercherPlots,
    addPlot,
    updatePlot,
    toggleAvailability,
    deletePlot,
    resetToDefault,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlotsStore, import.meta.hot))
}
