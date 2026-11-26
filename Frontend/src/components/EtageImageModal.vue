<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- En-tête -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-[#002855] text-white flex items-center justify-center text-xs font-bold">
            <i class="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-bold text-slate-900">
              Modifier le plan d'étage
            </h3>
            <p class="text-xs text-slate-500">
              {{ etage?.nom || 'Étage' }} &bull; {{ hospitalName }}
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <!-- Corps du formulaire -->
      <div class="p-6 overflow-y-auto space-y-5 flex-1">
        <!-- Message d'erreur -->
        <div
          v-if="errorMessage"
          class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2"
        >
          <i class="fa-solid fa-circle-exclamation shrink-0"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Aperçu de l'image actuelle -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Plan actuel
          </label>

          <div
            v-if="etage?.image_url"
            class="relative rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center max-h-56 p-2 group"
          >
            <img
              :src="etage.image_url"
              :alt="etage.nom"
              class="max-h-48 object-contain rounded-lg"
            />
            <div class="absolute bottom-2 right-2 bg-slate-900/75 text-white text-[11px] px-2 py-0.5 rounded font-medium">
              Image Cloudinary active
            </div>
          </div>

          <div
            v-else
            class="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-1"
          >
            <i class="fa-solid fa-image text-slate-400 text-xl"></i>
            <p class="text-xs font-semibold text-slate-600">Aucune image configurée</p>
            <p class="text-[11px] text-slate-400">Le système affiche actuellement le canevas architectural par défaut.</p>
          </div>
        </div>

        <!-- Zone de sélection / Drag and drop d'un nouveau fichier -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Nouvelle image de plan (JPEG, PNG ou WebP, max 4 Mo)
          </label>

          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            :class="[
              'rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-colors',
              isDragging
                ? 'border-[#002855] bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/60',
            ]"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="handleFileChange"
            />

            <!-- Si un nouveau fichier est sélectionné -->
            <div v-if="selectedFile" class="space-y-3">
              <div v-if="previewUrl" class="max-h-40 flex justify-center">
                <img
                  :src="previewUrl"
                  alt="Aperçu"
                  class="max-h-40 object-contain rounded-lg border border-slate-200 shadow-xs"
                />
              </div>
              <div class="text-xs">
                <p class="font-bold text-slate-800">{{ selectedFile.name }}</p>
                <p class="text-slate-500 text-[11px]">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button
                type="button"
                @click.stop="clearSelectedFile"
                class="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
              >
                Changer de fichier
              </button>
            </div>

            <!-- Si aucun fichier sélectionné -->
            <div v-else class="space-y-2 py-2">
              <div class="w-10 h-10 rounded-full bg-blue-50 text-[#002855] flex items-center justify-center mx-auto text-base">
                <i class="fa-solid fa-arrow-up-from-bracket"></i>
              </div>
              <div class="text-xs">
                <span class="font-bold text-[#002855]">Cliquez pour sélectionner un fichier</span>
                <span class="text-slate-500"> ou glissez-déposez ici</span>
              </div>
              <p class="text-[11px] text-slate-400">
                Formats : PNG, JPG, WebP jusqu'à 4 Mo
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions du pied de page -->
      <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <button
            v-if="etage?.image_url"
            type="button"
            @click="confirmDelete"
            :disabled="isSubmitting"
            class="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg border border-red-200 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <i class="fa-solid fa-trash-can text-[11px]"></i>
            <span>Supprimer le plan actuel</span>
          </button>
        </div>

        <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            @click="$emit('close')"
            :disabled="isSubmitting"
            class="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="button"
            @click="uploadImage"
            :disabled="!selectedFile || isSubmitting"
            class="px-4 py-2 bg-[#002855] hover:bg-[#001e40] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="isSubmitting" class="fa-solid fa-circle-notch fa-spin"></i>
            <i v-else class="fa-solid fa-cloud-arrow-up"></i>
            <span>{{ isSubmitting ? 'Téléversement...' : 'Enregistrer le plan' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useEtagesStore } from '../stores/etages.js'
import { useToastStore } from '../stores/toast.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  etage: { type: Object, default: null },
  hospitalName: { type: String, default: '' },
})

const emit = defineEmits(['close', 'updated'])

let etagesStore
try {
  etagesStore = useEtagesStore()
} catch {
  etagesStore = {
    uploadEtageImage: async () => {},
    deleteEtageImage: async () => {},
  }
}

let toastStore
try {
  toastStore = useToastStore()
} catch {
  toastStore = {
    show: () => {},
    close: () => {},
  }
}

const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref('')
const isDragging = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      clearSelectedFile()
      errorMessage.value = ''
    }
  },
)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(event) {
  const files = event.target?.files
  if (files && files[0]) {
    validateAndSetFile(files[0])
  }
}

function handleDrop(event) {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    validateAndSetFile(files[0])
  }
}

function validateAndSetFile(file) {
  errorMessage.value = ''
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!validTypes.includes(file.type)) {
    errorMessage.value = 'Le format du fichier doit être JPEG, PNG ou WebP'
    return
  }

  if (file.size > 4 * 1024 * 1024) {
    errorMessage.value = "La taille de l'image ne doit pas dépasser 4 Mo"
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function clearSelectedFile() {
  selectedFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'Ko', 'Mo', 'Go']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

async function uploadImage() {
  if (!selectedFile.value || !props.etage?.id) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const updated = await etagesStore.uploadEtageImage(props.etage.id, selectedFile.value)
    toastStore.show("Le plan d'étage a été téléversé avec succès.")
    emit('updated', updated)
    emit('close')
  } catch (err) {
    errorMessage.value = err.message || "Erreur lors de l'enregistrement de l'image"
  } finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!props.etage?.id) return

  const confirmed = window.confirm(
    "Êtes-vous sûr de vouloir supprimer le plan d'étage ? Cette action supprimera également l'image sur Cloudinary et les points d'emplacement associés.",
  )

  if (!confirmed) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const res = await etagesStore.deleteEtageImage(props.etage.id)
    toastStore.show("Le plan d'étage a été supprimé.")
    emit('updated', res)
    emit('close')
  } catch (err) {
    errorMessage.value = err.message || "Erreur lors de la suppression de l'image"
  } finally {
    isSubmitting.value = false
  }
}
</script>
