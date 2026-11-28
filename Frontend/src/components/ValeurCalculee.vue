<script setup>
defineProps({
  id: { type: String, required: true },
  valeur: { type: String, default: null },
  formule: { type: String, required: true },
  vide: { type: String, default: 'Calculé automatiquement' },
})
</script>

<template>
  <div>
    <output
      :id="id"
      for="superficie fl_id ff_id valorisation_totale"
      aria-live="polite"
      class="flex min-h-[2.45rem] cursor-default items-center rounded-[0.4rem] border border-dashed border-slate-300 bg-slate-50 px-3 py-2 tabular-nums"
      :class="valeur === null ? 'font-normal italic text-slate-400' : 'font-semibold text-slate-900'"
    >
      {{ valeur ?? vide }}
    </output>
    <p class="mt-1 text-xs text-slate-500">{{ formule }}</p>
  </div>
</template>
