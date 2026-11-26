<template>
  <div
    v-if="isOpen"
    ref="popoverRef"
    class="absolute right-0 top-full mt-2 z-50 w-64 bg-white border border-slate-200 rounded-lg shadow-lg p-2.5"
    role="region"
    aria-label="Niveaux d'achalandage"
  >
    <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
      <span class="text-xs font-semibold text-slate-700">Fréquentation / jour</span>
      <button
        type="button"
        @click="$emit('close')"
        aria-label="Fermer"
        class="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer leading-none"
      >
        <i class="fa-solid fa-xmark text-xs"></i>
      </button>
    </div>

    <ul class="space-y-0.5">
      <li
        v-for="level in ACHALANDAGE_LEVELS"
        :key="level.id"
        :data-level-id="level.id"
        :class="[
          'flex items-center justify-between px-2 py-1 rounded text-xs',
          isCurrentLevel(level.id)
            ? 'bg-teal-50 text-teal-800 font-semibold'
            : 'text-slate-600',
        ]"
      >
        <span>Niveau {{ level.id }}</span>
        <span>{{ level.range }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  currentLevel: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['close'])
const popoverRef = ref(null)

const ACHALANDAGE_LEVELS = [
  { id: 1, range: '3 à 19 pers.' },
  { id: 2, range: '20 à 39 pers.' },
  { id: 3, range: '40 à 79 pers.' },
  { id: 4, range: '80 à 199 pers.' },
  { id: 5, range: '200 à 399 pers.' },
  { id: 6, range: '400 à 899 pers.' },
  { id: 7, range: '900 à 2 699 pers.' },
  { id: 8, range: '2 700 pers. et +' },
]

function isCurrentLevel(levelId) {
  if (
    props.currentLevel === null ||
    props.currentLevel === undefined ||
    props.currentLevel === ''
  ) {
    return false
  }
  return Number(props.currentLevel) === levelId
}

function handleKeydown(event) {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

function handleClickOutside(event) {
  if (!props.isOpen || !popoverRef.value) return
  if (!popoverRef.value.contains(event.target)) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>
