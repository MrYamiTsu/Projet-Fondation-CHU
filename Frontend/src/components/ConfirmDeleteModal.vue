<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]"
        @click.self="step === 1 && cancel()"
        @keydown.esc.prevent="cancel"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
          class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border transition-colors duration-200"
          :class="step === 2 ? 'border-red-200' : 'border-slate-200'"
        >
          <div class="h-1 bg-slate-100">
            <div
              class="h-full bg-red-500 transition-all duration-300 ease-out"
              :style="{ width: step === 1 ? '50%' : '100%' }"
            ></div>
          </div>

          <div class="px-6 pt-5 pb-4">
            <div class="flex items-start gap-3.5">
              <div
                class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors duration-200"
                :class="step === 2 ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'"
              >
                <i
                  :class="step === 2 ? 'fa-solid fa-triangle-exclamation' : 'fa-regular fa-trash-can'"
                  class="text-sm"
                ></i>
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Étape {{ step }} sur 2
                </p>
                <h3 :id="titleId" class="mt-0.5 text-base font-bold text-slate-900">
                  {{ step === 1 ? title : 'Cette action est définitive' }}
                </h3>
              </div>
            </div>

            <div :id="descriptionId" class="mt-4">
              <template v-if="step === 1">
                <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p class="text-sm font-semibold text-slate-900 truncate">{{ itemName }}</p>
                  <p v-if="itemDetails" class="text-xs text-slate-500 mt-0.5 truncate">
                    {{ itemDetails }}
                  </p>
                </div>

                <ul class="mt-4 space-y-2 text-xs text-slate-600">
                  <li v-for="consequence in consequences" :key="consequence" class="flex gap-2">
                    <i class="fa-solid fa-minus text-[9px] text-red-400 mt-1"></i>
                    <span>{{ consequence }}</span>
                  </li>
                  <li class="flex gap-2 font-semibold text-slate-800">
                    <i class="fa-solid fa-minus text-[9px] text-red-400 mt-1"></i>
                    <span>Aucune restauration possible après la suppression.</span>
                  </li>
                </ul>
              </template>

              <template v-else>
                <p class="text-sm text-slate-600">
                  <span class="font-semibold text-slate-900">{{ itemName }}</span>
                  sera supprimé immédiatement et pour de bon.
                </p>

                <label :for="inputId" class="block mt-4 text-xs text-slate-600">
                  Pour confirmer, tapez
                  <span class="font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">{{ confirmWord }}</span>
                  ci-dessous.
                </label>
                <input
                  :id="inputId"
                  ref="inputRef"
                  v-model="typed"
                  type="text"
                  autocomplete="off"
                  spellcheck="false"
                  :disabled="isDeleting"
                  class="mt-2 w-full rounded-lg border px-3 py-2 text-sm font-mono tracking-wide outline-none transition-colors"
                  :class="
                    isConfirmed
                      ? 'border-red-400 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100'
                  "
                  @keydown.enter.prevent="confirm"
                />
              </template>

              <p
                v-if="errorMessage"
                role="alert"
                class="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                <i class="fa-solid fa-circle-exclamation mt-0.5"></i>
                <span>{{ errorMessage }}</span>
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <button
              ref="cancelRef"
              type="button"
              :disabled="isDeleting"
              class="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              @click="cancel"
            >
              Annuler
            </button>

            <button
              v-if="step === 1"
              type="button"
              class="px-4 py-2 rounded-lg text-xs font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
              @click="goToStep2"
            >
              Continuer
            </button>

            <button
              v-else
              type="button"
              :disabled="!isConfirmed || isDeleting"
              class="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer inline-flex items-center gap-2 disabled:bg-red-300 disabled:cursor-not-allowed"
              @click="confirm"
            >
              <i v-if="isDeleting" class="fa-solid fa-circle-notch fa-spin text-[11px]"></i>
              <span>{{ isDeleting ? 'Suppression…' : 'Supprimer définitivement' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, useId } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'Supprimer cet élément ?' },
  itemName: { type: String, required: true },
  itemDetails: { type: String, default: '' },
  consequences: { type: Array, default: () => [] },
  confirmWord: { type: String, default: 'SUPPRIMER' },
  onConfirm: { type: Function, required: true },
})

const emit = defineEmits(['close', 'deleted'])

const step = ref(1)
const typed = ref('')
const isDeleting = ref(false)
const errorMessage = ref('')
const cancelRef = ref(null)
const inputRef = ref(null)

const uid = useId()
const titleId = `${uid}-title`
const descriptionId = `${uid}-description`
const inputId = `${uid}-input`

const isConfirmed = computed(
  () => typed.value.trim().toUpperCase() === props.confirmWord.toUpperCase(),
)

watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return
    step.value = 1
    typed.value = ''
    errorMessage.value = ''
    isDeleting.value = false
    await nextTick()
    cancelRef.value?.focus()
  },
  { immediate: true },
)

async function goToStep2() {
  step.value = 2
  errorMessage.value = ''
  await nextTick()
  inputRef.value?.focus()
}

function cancel() {
  if (isDeleting.value) return
  emit('close')
}

async function confirm() {
  if (step.value !== 2 || !isConfirmed.value || isDeleting.value) return

  isDeleting.value = true
  errorMessage.value = ''
  try {
    await props.onConfirm()
    emit('deleted')
    emit('close')
  } catch (err) {
    errorMessage.value = err?.message || 'La suppression a échoué.'
  } finally {
    isDeleting.value = false
  }
}
</script>
