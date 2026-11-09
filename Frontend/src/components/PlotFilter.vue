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
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div>
        <label
          class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between"
        >
          <span class="flex items-center gap-1.5">
            <i class="fa-regular fa-calendar-days text-teal-600 text-[10px]"></i>
            <span>Dates souhaitées</span>
          </span>
          <span
            v-if="hasActiveDateFilter"
            class="text-[9px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200"
          >
            Période active
          </span>
        </label>
        <div class="filter-datepicker-wrapper">
          <VueDatePicker
            v-model="dateRangeModel"
            :range="{ noDisabledRange: false, partialRange: false }"
            :time-config="{ enableTimePicker: false }"
            :enable-time-picker="false"
            :format="formatRange"
            :min-date="today"
            placeholder="Choisir des dates"
            auto-apply
            :clearable="true"
          />
        </div>
      </div>
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
            <option value="available">
              {{ hasActiveDateFilter ? 'Disponibles sur ces dates' : 'Disponibles seulement' }}
            </option>
            <option value="reserved">
              {{ hasActiveDateFilter ? 'Réservés sur ces dates' : 'Réservés / Occupés' }}
            </option>
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
            class="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-mono"
          >
            {{ Number(modelValue.maxPrice).toLocaleString('fr-CA') }} $ CAD
          </span>
        </div>
        <input
          type="range"
          :min="minRange"
          :max="maxRange"
          :step="stepValue"
          :value="modelValue.maxPrice"
          @input="updateFilter('maxPrice', Number($event.target.value))"
          class="custom-range-slider w-full h-2 rounded-lg cursor-pointer transition-all"
          :style="{
            background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${progressPercent}, #e2e8f0 ${progressPercent}, #e2e8f0 100%)`,
          }"
        />
        <div class="flex justify-between text-[10px] text-slate-400 mt-1 font-medium font-mono">
          <span>{{ Number(minRange).toLocaleString('fr-CA') }} $</span>
          <span>{{ Number(maxRange).toLocaleString('fr-CA') }} $</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { usePlotsStore } from '../stores/plots.js'

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

const today = new Date()
const minRange = 0
const stepValue = 5000

const hasActiveDateFilter = computed(() => {
  const range = props.modelValue?.dateRange
  return Array.isArray(range) && Boolean(range[0]) && Boolean(range[1])
})

const dateRangeModel = computed({
  get: () => props.modelValue?.dateRange ?? null,
  set: (val) => updateFilter('dateRange', val),
})

function formatRange(dates) {
  if (!dates) return ''
  const fmt = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  if (Array.isArray(dates)) {
    if (dates[0] && dates[1]) return `${fmt(dates[0])} au ${fmt(dates[1])}`
    if (dates[0]) return fmt(dates[0])
    return ''
  }
  return fmt(dates)
}

const effectivePlots = computed(() => {
  if (props.plots && props.plots.length > 0) {
    return props.plots
  }
  if (plotsStore.plots && plotsStore.plots.length > 0) {
    return plotsStore.plots
  }
  return []
})

const allPlotsCount = computed(() => effectivePlots.value.length)

const maxRange = computed(() => {
  if (!effectivePlots.value || effectivePlots.value.length === 0) return 100000
  const max = Math.max(...effectivePlots.value.map((p) => Number(p.price) || 0), 100000)
  return Math.ceil(max / 10000) * 10000
})

const progressPercent = computed(() => {
  const current = Number(props.modelValue?.maxPrice ?? 100000)
  const min = minRange
  const max = maxRange.value
  if (max <= min) return '100%'
  const percent = Math.min(100, Math.max(0, ((current - min) / (max - min)) * 100))
  return `${percent}%`
})

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

<style scoped>
.custom-range-slider {
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}

.custom-range-slider:focus {
  outline: none;
}

/* Chrome, Edge, Safari */
.custom-range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  border: 2.5px solid #0d9488;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.25), 0 1px 2px -1px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.custom-range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  border-color: #0f766e;
  box-shadow: 0 2px 6px 0 rgba(13, 148, 136, 0.4);
}

.custom-range-slider::-webkit-slider-thumb:active {
  transform: scale(1.25);
  background: #f0fdfa;
  border-color: #115e59;
}

/* Firefox */
.custom-range-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  border: 2.5px solid #0d9488;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.25), 0 1px 2px -1px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.custom-range-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  border-color: #0f766e;
  box-shadow: 0 2px 6px 0 rgba(13, 148, 136, 0.4);
}

.custom-range-slider::-moz-range-thumb:active {
  transform: scale(1.25);
  background: #f0fdfa;
  border-color: #115e59;
}

.custom-range-slider::-moz-range-track {
  background: transparent;
  height: 8px;
  border-radius: 8px;
}

:deep(.filter-datepicker-wrapper) {
  --dp-primary-color: #0d9488;
  --dp-primary-text-color: #ffffff;
  --dp-border-radius: 0.75rem;
  --dp-font-size: 0.75rem;
}

:deep(.dp__input) {
  background-color: #f8fafc;
  border-color: #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  line-height: 1.25rem;
  padding: 0.55rem 0.75rem 0.55rem 2.25rem;
  color: #1e293b;
  font-weight: 500;
  font-family: inherit;
  box-shadow: none;
}

:deep(.dp__input:hover) {
  border-color: #cbd5e1;
}

:deep(.dp__input:focus) {
  border-color: #0d9488;
  outline: none;
}

:deep(.dp__icon) {
  color: #0d9488;
}
</style>
