<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-8 max-w-md w-full text-center relative"
    >
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        title="Fermer"
      >
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
      <h3 class="text-xl font-bold text-slate-900">
        {{ plot?.name || "Nom de l'emplacement" }}
      </h3>
    </div>
  </div>
</template>

<script setup>
defineProps({
  plot: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['close'])
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
