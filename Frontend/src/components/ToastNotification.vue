<script setup>
import { storeToRefs } from 'pinia'
import { useToastStore } from '../stores/toast'

const toast = useToastStore()
const { message } = storeToRefs(toast)
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4" aria-live="polite">
    <Transition name="toast">
      <div
        v-if="message"
        role="status"
        class="pointer-events-auto flex items-center gap-4 rounded-lg bg-teal-800 px-5 py-3 text-white shadow-lg"
      >
        <span>{{ message }}</span>
        <button type="button" class="text-sm underline" @click="toast.close">Fermer</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}
</style>
