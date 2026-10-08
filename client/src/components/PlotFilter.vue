<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Filtres</h3>
        <span
          v-if="resultCount !== undefined"
          class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200"
        >
          {{ resultCount }} emplacement{{ resultCount > 1 ? 's' : '' }}
        </span>
      </div>
      <button
        @click="$emit('reset')"
        class="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
      >
        Réinitialiser
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
          Secteur
        </label>
        <select
          :value="modelValue.sector"
          @change="updateFilter('sector', $event.target.value)"
          class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 font-medium"
        >
          <option value="">Tous les secteurs</option>
          <option v-for="sec in availableSectors" :key="sec" :value="sec">
            {{ sec }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
          Statut
        </label>
        <select
          :value="modelValue.availability"
          @change="updateFilter('availability', $event.target.value)"
          class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 font-medium"
        >
          <option value="">Tous les statuts</option>
          <option value="available">Disponibles seulement</option>
          <option value="reserved">Réservés / Occupés</option>
        </select>
      </div>

      <div>
        <div class="flex justify-between items-center mb-1">
          <label class="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Prix maximum
          </label>
          <span class="text-xs font-black text-teal-600">
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
          class="w-full accent-teal-500 cursor-pointer"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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

const availableSectors = computed(() => {
  const sectors = props.plots.map((p) => p.sector).filter(Boolean)
  return [...new Set(sectors)].sort()
})

function updateFilter(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}
</script>
