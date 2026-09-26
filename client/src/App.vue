<template>
  <div
    class="min-h-screen flex flex-col justify-between bg-slate-100 text-slate-800 selection:bg-blue-500 selection:text-white"
  >
    <div>
      <Header
        :hospitals="hospitals"
        :selected-hospital="selectedHospital"
        @select-hospital="handleHospitalSelect"
      />
      <main class="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-8">
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <Map
            :pins="hospitalPins"
            :active-hospital="selectedHospital"
            @select-pin="handleHospitalSelect"
          />

          <Valuation />
        </div>
        <div>
          <PlotList :plots="filteredPlots" @open-modal="selectedPlot = $event" />
        </div>
      </main>
    </div>
    <PlotDetail v-if="selectedPlot" :plot="selectedPlot" @close="selectedPlot = null" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Header from './components/Header.vue'
import Map from './components/Map.vue'
import Valuation from './components/Valuation.vue'
import PlotList from './components/PlotList.vue'
import PlotDetail from './components/PlotDetail.vue'

import { hospitals, hospitalPins, mockPlots } from './data/mockData.js'

const selectedHospital = ref('')
const selectedPlot = ref(null)

const filteredPlots = computed(() => {
  if (!selectedHospital.value) return mockPlots
  return mockPlots.filter((plot) => plot.hospital === selectedHospital.value)
})

function handleHospitalSelect(code) {
  selectedHospital.value = selectedHospital.value === code ? '' : code
}
</script>
