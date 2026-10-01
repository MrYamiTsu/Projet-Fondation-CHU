<template>
  <div
    class="min-h-screen flex flex-col justify-between bg-slate-100 text-slate-800 selection:bg-blue-500 selection:text-white"
  >
    <div>
      <Header
        :hospitals="hospitals"
        :selected-hospital="selectedHospital"
        :current-user="currentUser"
        @select-hospital="handleHospitalSelect"
        @open-auth="isAuthModalOpen = true"
        @logout="handleLogout"
      >
        <template #auth>
          <Auth
            :is-open="isAuthModalOpen"
            :users="sessionUsers"
            @close="isAuthModalOpen = false"
            @login="handleLoginSuccess"
            @signup="handleSignUpSuccess"
          />
        </template>
      </Header>

      <main class="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-8">
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <Map
            :pins="hospitalPins"
            :active-hospital="selectedHospital"
            @select-pin="handleHospitalSelect"
          />

          <Valuation />
        </div>

        <PlotFilters
          v-model="filters"
          :plots="mockPlots"
          :result-count="filteredPlots.length"
          @reset="resetFilters"
        />

        <div>
          <PlotList :plots="filteredPlots" @open-modal="openPlotDetail" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from '../components/Header.vue'
import Map from '../components/Map.vue'
import Valuation from '../components/Valuation.vue'
import PlotList from '../components/PlotList.vue'
import PlotFilters from '../components/PlotFilter.vue'
import Auth from '../components/Auth.vue'

import { hospitals, hospitalPins, mockPlots } from '../data/mockData.js'

const router = useRouter()
const route = useRoute()

const isAuthModalOpen = ref(false)
const currentUser = ref(null)

const sessionUsers = ref([
  { name: 'Admin', email: 'admin@admin.ca', password: '123', admin: true },
  { name: 'User', email: 'user@user.ca', password: '123', admin: false },
])

const defaultFilters = {
  sector: '',
  availability: '',
  maxPrice: 500000,
}

const selectedHospital = ref(route.query.hospital || '')

const filters = ref({
  sector: route.query.sector || defaultFilters.sector,
  availability: route.query.availability || defaultFilters.availability,
  maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : defaultFilters.maxPrice,
})

watch(
  [selectedHospital, filters],
  () => {
    const query = {}

    if (selectedHospital.value) query.hospital = selectedHospital.value
    if (filters.value.sector) query.sector = filters.value.sector
    if (filters.value.availability) query.availability = filters.value.availability
    if (filters.value.maxPrice !== defaultFilters.maxPrice) query.maxPrice = filters.value.maxPrice

    router.replace({ query })
  },
  { deep: true },
)

const filteredPlots = computed(() => {
  return mockPlots.filter((plot) => {
    if (selectedHospital.value && plot.hospital !== selectedHospital.value) return false
    if (filters.value.sector && plot.sector !== filters.value.sector) return false
    if (filters.value.availability === 'available' && !plot.available) return false
    if (filters.value.availability === 'reserved' && plot.available) return false
    if (plot.price && plot.price > filters.value.maxPrice) return false

    return true
  })
})

function handleHospitalSelect(code) {
  selectedHospital.value = selectedHospital.value === code ? '' : code
}

function resetFilters() {
  filters.value = { ...defaultFilters }
}

function openPlotDetail(plot) {
  router.push(`/emplacement/${plot.id}`)
}

function handleLoginSuccess(user) {
  currentUser.value = { name: user.name, email: user.email }
}

function handleSignUpSuccess(newUser) {
  sessionUsers.value.push(newUser)
  currentUser.value = { name: newUser.name, email: newUser.email }
}

function handleLogout() {
  currentUser.value = null
}
</script>
