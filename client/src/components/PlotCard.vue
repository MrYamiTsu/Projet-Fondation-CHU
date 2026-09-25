<template>
  <div
    @click="$emit('select', plot)"
    class="min-w-[240px] w-64 h-72 flex-shrink-0 bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-slate-300 transition-all"
  >
    <span class="text-xs font-bold text-slate-400 uppercase tracking-wide">
      {{ plot?.name || 'Carte Espace' }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  plot: { type: Object, default: () => ({}) },
})
defineEmits(['select'])
</script>
