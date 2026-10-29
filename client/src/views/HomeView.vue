<template>
  <div
    class="min-h-screen flex flex-col justify-between bg-slate-100 text-slate-800 selection:bg-blue-500 selection:text-white"
  >
    <div>
      <Header
        :current-user="authStore.currentUser"
        @open-auth="isAuthModalOpen = true"
        @logout="handleLogout"
      >
        <template #auth>
          <Auth
            :is-open="isAuthModalOpen"
            :users="authStore.users"
            @close="isAuthModalOpen = false"
            @login="handleLoginSuccess"
            @signup="handleSignUpSuccess"
          />
        </template>
      </Header>

      <div v-if="accessAlert" class="max-w-[1600px] mx-auto px-4 lg:px-8 pt-6">
        <div
          class="p-4 rounded-2xl flex items-center justify-between gap-4 border shadow-lg"
          :class="
            accessAlert.type === 'danger'
              ? 'bg-red-950/90 text-red-100 border-red-500/50'
              : 'bg-amber-950/90 text-amber-100 border-amber-500/50'
          "
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
              :class="
                accessAlert.type === 'danger'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-amber-500/20 text-amber-400'
              "
            >
              <i
                :class="accessAlert.type === 'danger' ? 'fa-solid fa-ban' : 'fa-solid fa-lock'"
              ></i>
            </div>
            <div>
              <p class="font-bold text-sm">{{ accessAlert.title }}</p>
              <p class="text-xs opacity-90 mt-0.5">{{ accessAlert.message }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="!authStore.isAuthenticated"
              @click="isAuthModalOpen = true"
              class="px-3 py-1.5 bg-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg cursor-pointer hover:bg-teal-400 transition-colors"
            >
              Se connecter
            </button>
            <button
              @click="accessAlert = null"
              class="text-xs opacity-75 hover:opacity-100 p-1 cursor-pointer"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <main class="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-8">
        <!-- Section Carte Interactive & Cartes d'Hôpitaux + Valorisation -->
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
          <Map
            class="xl:col-span-8"
            :hospitals="hospitals"
            :pins="hospitalPins"
            :active-hospital="selectedHospital"
            :search-query="searchQuery"
            @update:search-query="searchQuery = $event"
            @select-hospital="handleHospitalSelect"
          />
          <Valuation class="xl:col-span-4" :selected-hospital="selectedHospital" />
        </div>

        <!-- Section des Filtres & Emplacements Recherchés -->
        <div id="recherche" class="space-y-8 scroll-mt-24">
          <!-- Section des Filtres (Secteur, Disponibilité, Budget) -->
          <PlotFilters
            v-model="filters"
            :plots="plotsStore.plots"
            :result-count="filteredPlots.length"
            @reset="resetFilters"
          />

          <!-- Liste des Emplacements -->
          <div id="emplacements" class="scroll-mt-24">
            <PlotList :plots="filteredPlots" @open-modal="openPlotDetail" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from '../components/Header.vue'
import Map from '../components/Map.vue'
import Valuation from '../components/Valuation.vue'
import PlotList from '../components/PlotList.vue'
import PlotFilters from '../components/PlotFilter.vue'
import Auth from '../components/Auth.vue'

import { hospitals, hospitalPins } from '../data/mockData.js'
import { useAuthStore } from '../stores/auth.js'
import { usePlotsStore } from '../stores/plots.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const plotsStore = usePlotsStore()

const isAuthModalOpen = ref(false)
const accessAlert = ref(null)

const defaultFilters = {
  sector: '',
  availability: '',
  maxPrice: 100000,
}

const selectedHospital = ref(route.query.hospital || '')
const searchQuery = ref(route.query.q || '')

const filters = ref({
  sector: route.query.sector || defaultFilters.sector,
  availability: route.query.availability || defaultFilters.availability,
  maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : defaultFilters.maxPrice,
})

// Synchronisation des états vers les query parameters de l'URL
watch(
  [selectedHospital, filters, searchQuery],
  () => {
    const query = { ...route.query }
    if (selectedHospital.value) {
      query.hospital = selectedHospital.value
    } else {
      delete query.hospital
    }
    if (filters.value.sector) {
      query.sector = filters.value.sector
    } else {
      delete query.sector
    }
    if (filters.value.availability) {
      query.availability = filters.value.availability
    } else {
      delete query.availability
    }
    if (filters.value.maxPrice !== defaultFilters.maxPrice) {
      query.maxPrice = String(filters.value.maxPrice)
    } else {
      delete query.maxPrice
    }
    if (searchQuery.value && searchQuery.value.trim()) {
      query.q = searchQuery.value.trim()
    } else {
      delete query.q
    }

    const hasChanged =
      (query.hospital || '') !== (route.query.hospital || '') ||
      (query.sector || '') !== (route.query.sector || '') ||
      (query.availability || '') !== (route.query.availability || '') ||
      String(query.maxPrice || '') !== String(route.query.maxPrice || '') ||
      (query.q || '') !== (route.query.q || '')

    if (hasChanged) {
      router.replace({ query, hash: route.hash })
    }
  },
  { deep: true },
)

function checkRouteAlerts() {
  if (route.query.reason === 'admin_forbidden') {
    accessAlert.value = {
      type: 'danger',
      title: 'Accès administrateur requis',
      message:
        'Votre compte actuel ne dispose pas des privilèges administrateur pour accéder à cette vue.',
    }
  } else if (route.query.reason === 'login_required' || route.query.authModal === '1') {
    accessAlert.value = {
      type: 'warning',
      title: 'Authentification requise',
      message:
        'Veuillez vous connecter avec un compte administrateur pour accéder au panneau de gestion.',
    }
    isAuthModalOpen.value = true
  }
}

function scrollToTarget(isInstant = false) {
  const hash = route.hash || (route.query.hospital || route.query.sector ? '#recherche' : '')
  if (!hash) return

  const cleanId = hash.replace('#', '')

  const performScroll = (behavior = 'auto') => {
    const el =
      document.getElementById(cleanId) ||
      document.getElementById('recherche') ||
      document.getElementById('emplacements')
    if (el) {
      const headerOffset = 80
      const rect = el.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const targetY = rect.top + scrollTop - headerOffset

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: behavior,
      })
      return true
    }
    return false
  }

  // Application immédiate
  performScroll(isInstant ? 'auto' : 'smooth')
  nextTick(() => {
    performScroll(isInstant ? 'auto' : 'smooth')
  })
  // Réajustement après montage du DOM et chargement des composants
  setTimeout(() => {
    performScroll(isInstant ? 'auto' : 'smooth')
  }, 100)
  setTimeout(() => {
    performScroll(isInstant ? 'auto' : 'smooth')
  }, 300)
}

onMounted(() => {
  checkRouteAlerts()
  plotsStore.getPlots()
  scrollToTarget(true)
})

// Quand l'utilisateur navigue avec l'historique ou un lien externe
watch(
  () => route.query,
  (newQuery) => {
    checkRouteAlerts()
    selectedHospital.value = newQuery.hospital || ''
    filters.value.sector = newQuery.sector || defaultFilters.sector
    filters.value.availability = newQuery.availability || defaultFilters.availability
    filters.value.maxPrice = newQuery.maxPrice ? Number(newQuery.maxPrice) : defaultFilters.maxPrice
    searchQuery.value = newQuery.q || ''

    if (route.hash || newQuery.hospital || newQuery.sector) {
      scrollToTarget(false)
    }
  },
)

watch(
  () => route.hash,
  () => {
    scrollToTarget(false)
  },
)

const filteredPlots = computed(() => {
  return plotsStore.plots.filter((plot) => {
    // 1. Filtre par Hôpital
    if (selectedHospital.value && plot.hospital !== selectedHospital.value) {
      return false
    }

    // 2. Filtre par Secteur
    if (filters.value.sector) {
      const targetSector = filters.value.sector.trim().toLowerCase()
      const plotSector = (plot.sector || '').trim().toLowerCase()
      if (plotSector !== targetSector) return false
    }

    // 3. Filtre par Disponibilité
    if (filters.value.availability === 'available' && !plot.available) {
      return false
    }
    if (filters.value.availability === 'reserved' && plot.available) {
      return false
    }

    // 4. Filtre par Prix maximum
    if (plot.price && plot.price > filters.value.maxPrice) {
      return false
    }

    // 5. Recherche textuelle (nom, hôpital ou secteur)
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchName = plot.name?.toLowerCase().includes(q)
      const matchSector = plot.sector?.toLowerCase().includes(q)
      const matchHospital = plot.hospital?.toLowerCase().includes(q)
      if (!matchName && !matchSector && !matchHospital) return false
    }

    return true
  })
})

function handleHospitalSelect(code) {
  selectedHospital.value = selectedHospital.value === code ? '' : code
}

function resetFilters() {
  filters.value = { ...defaultFilters }
  searchQuery.value = ''
  selectedHospital.value = ''
}

function openPlotDetail(plot) {
  router.push({
    path: `/emplacement/${plot.id}`,
    query: { ...route.query },
  })
}

function handleLoginSuccess(user) {
  isAuthModalOpen.value = false
  accessAlert.value = null
  if (user?.admin && route.query.reason) {
    router.push('/admin')
  }
}

function handleSignUpSuccess() {
  isAuthModalOpen.value = false
  accessAlert.value = null
}

function handleLogout() {
  authStore.logout()
}
</script>
