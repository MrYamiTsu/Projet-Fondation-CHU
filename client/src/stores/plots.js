import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockPlots as initialMockPlots } from '../data/mockData.js'

export const usePlotsStore = defineStore('plots', () => {
  const loadPlots = () => {
    try {
      const saved = localStorage.getItem('chu_plots')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Erreur lors du chargement des emplacements:', e)
    }
    return initialMockPlots
  }

  const plots = ref(loadPlots())

  function persist() {
    try {
      localStorage.setItem('chu_plots', JSON.stringify(plots.value))
    } catch (e) {
      console.error('Erreur de sauvegarde des emplacements:', e)
    }
  }

  const totalPlots = computed(() => plots.value.length)
  const availablePlots = computed(() => plots.value.filter((p) => p.available).length)
  const reservedPlots = computed(() => plots.value.filter((p) => !p.available).length)
  const totalValuation = computed(() =>
    plots.value.reduce((acc, p) => acc + (Number(p.price) || 0), 0),
  )

  function formatPrice(amount) {
    return `${new Intl.NumberFormat('fr-CA').format(amount)} $ CAD`
  }

  function getPlotById(id) {
    return plots.value.find((p) => p.id === Number(id))
  }

  function addPlot(plotData) {
    const nextId = plots.value.length > 0 ? Math.max(...plots.value.map((p) => p.id)) + 1 : 1
    const priceNum = Number(plotData.price) || 0
    const newPlot = {
      id: nextId,
      name: plotData.name,
      hospital: plotData.hospital,
      sector: plotData.sector || 'Général',
      price: priceNum,
      formattedPrice: formatPrice(priceNum),
      available: plotData.available !== undefined ? plotData.available : true,
      image:
        plotData.image ||
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop',
      description: plotData.description || '',
      dimensions: plotData.dimensions || '25 m²',
      valeur15ans: plotData.valeur15ans || formatPrice(priceNum * 1.5),
      achalandage: plotData.achalandage || 'Élevé (~1 200 passages/jour)',
    }
    plots.value.unshift(newPlot)
    persist()
    return newPlot
  }

  function updatePlot(id, updatedData) {
    const index = plots.value.findIndex((p) => p.id === Number(id))
    if (index === -1) return null

    const priceNum = Number(updatedData.price) || plots.value[index].price
    plots.value[index] = {
      ...plots.value[index],
      ...updatedData,
      id: Number(id),
      price: priceNum,
      formattedPrice: formatPrice(priceNum),
    }
    persist()
    return plots.value[index]
  }

  function toggleAvailability(id) {
    const item = plots.value.find((p) => p.id === Number(id))
    if (item) {
      item.available = !item.available
      persist()
      return item.available
    }
    return null
  }

  function deletePlot(id) {
    const beforeCount = plots.value.length
    plots.value = plots.value.filter((p) => p.id !== Number(id))
    if (plots.value.length !== beforeCount) {
      persist()
      return true
    }
    return false
  }

  function resetToDefault() {
    plots.value = [...initialMockPlots]
    persist()
  }

  return {
    plots,
    totalPlots,
    availablePlots,
    reservedPlots,
    totalValuation,
    formatPrice,
    getPlotById,
    addPlot,
    updatePlot,
    toggleAvailability,
    deletePlot,
    resetToDefault,
  }
})

