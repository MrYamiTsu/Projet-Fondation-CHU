<template>
  <section
    class="xl:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-between"
  >
    <div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 class="text-lg font-bold text-slate-900">EMPLACEMENTS</h3>
          <p class="text-xs text-slate-500 mt-0.5">Liste de l'ensemble des espaces disponibles</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500 font-semibold"> {{ plots.length }} espace(s) </span>
        </div>
      </div>
      <div v-if="plots.length > 0" class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        <PlotCard
          v-for="plot in plots"
          :key="plot.id"
          :plot="plot"
          @select="$emit('open-modal', plot)"
        />
      </div>
      <div
        v-else
        class="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200"
      >
        <p class="text-xs">Aucun emplacement à afficher.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import PlotCard from './PlotCard.vue'

defineProps({ plots: { type: Array, default: () => [] } })
defineEmits(['open-modal'])
</script>
