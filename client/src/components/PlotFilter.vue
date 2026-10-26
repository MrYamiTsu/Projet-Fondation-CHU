<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <div class="flex items-center gap-2">
        <div
          class="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-600 flex items-center justify-center text-xs"
        >
          <i class="fa-solid fa-sliders"></i>
        </div>
        <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">
          Filtres de recherche
        </h3>
        <span
          v-if="resultCount !== undefined"
          class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200"
        >
          {{ resultCount }} espace{{ resultCount > 1 ? 's' : '' }} trouvé{{
            resultCount > 1 ? 's' : ''
          }}
        </span>
      </div>
      <button
        @click="$emit('reset')"
        class="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <i class="fa-solid fa-rotate-left text-[10px]"></i>
        <span>Réinitialiser les filtres</span>
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label
          class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5"
        >
          <i class="fa-solid fa-stethoscope text-teal-600 text-[10px]"></i>
          <span>Secteur</span>
        </label>
        <div class="relative">
          <select
            :value="modelValue.sector"
            @change="updateFilter('sector', $event.target.value)"
            class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 font-medium cursor-pointer transition-colors pr-8 appearance-none"
          >
            <option value="">Tous les secteurs ({{ allPlotsCount }})</option>
            <option v-for="sec in availableSectors" :key="sec" :value="sec">
              {{ sec }} ({{ getSectorCount(sec) }})
            </option>
          </select>
          <i
            class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none"
          ></i>
        </div>
      </div>
      <div>
        <label
          class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5"
        >
          <i class="fa-solid fa-circle-check text-teal-600 text-[10px]"></i>
          <span>Disponibilité</span>
        </label>
        <div class="relative">
          <select
            :value="modelValue.availability"
            @change="updateFilter('availability', $event.target.value)"
            class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 font-medium cursor-pointer transition-colors pr-8 appearance-none"
          >
            <option value="">Tous les statuts</option>
            <option value="available">Disponibles seulement</option>
            <option value="reserved">Réservés / Occupés</option>
          </select>
          <i
            class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none"
          ></i>
        </div>
      </div>
      <div>
        <div class="flex justify-between items-center mb-1">
          <label class="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Prix maximum
          </label>
          <span
            class="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200"
          >
            {{ Number(modelValue.maxPrice).toLocaleString('fr-CA') }} $ CAD
          </span>
        </div>
        <input
          type="range"
          min="100000"
          max="500000"
          step="10000"
          :value="modelValue.maxPrice"
          @input="updateFilter('maxPrice', Number($event.target.value))"
          class="w-full accent-teal-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
        />
        <div class="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>100 000 $</span>
          <span>500 000 $</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlotsStore } from '../stores/plots.js'
import { mockPlots as fallbackMockPlots } from '../data/mockData.js'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  plots: {
    type: Array,
    default: () => [],
  },
  resultCount: {
    type: Number,
    default: undefined,
  },
})

const emit = defineEmits(['update:modelValue', 'reset'])

const plotsStore = usePlotsStore()

const effectivePlots = computed(() => {
  if (props.plots && props.plots.length > 0) {
    return props.plots
  }
  if (plotsStore.plots && plotsStore.plots.length > 0) {
    return plotsStore.plots
  }
  return fallbackMockPlots
})

const allPlotsCount = computed(() => effectivePlots.value.length)

const availableSectors = computed(() => {
  const sectors = effectivePlots.value.map((p) => p.sector).filter(Boolean)
  return [...new Set(sectors)].sort((a, b) => a.localeCompare(b, 'fr'))
})

function getSectorCount(sectorName) {
  return effectivePlots.value.filter(
    (p) => p.sector && p.sector.toLowerCase() === sectorName.toLowerCase(),
  ).length
}

function updateFilter(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}
</script>
