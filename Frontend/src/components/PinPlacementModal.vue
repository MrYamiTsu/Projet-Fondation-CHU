<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- En-tête -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-[#002855] text-white flex items-center justify-center text-xs font-bold">
            <i class="fa-solid fa-location-dot"></i>
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-bold text-slate-900">
              Positionner un emplacement
            </h3>
            <p class="text-xs text-slate-500">
              {{ etage?.nom }} &bull; Position relative : X: {{ formatCoord(coords?.x) }} | Y: {{ formatCoord(coords?.y) }}
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

      <!-- Corps : Sélection du local -->
      <div class="p-6 overflow-y-auto space-y-4 flex-1">
        <!-- Message d'erreur -->
        <div
          v-if="errorMessage"
          class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2"
        >
          <i class="fa-solid fa-circle-exclamation shrink-0"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Recherche et filtres d'affichage -->
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Choisir le local à associer
            </label>

            <!-- Filtre : Seulement non positionnés vs Tous -->
            <div class="flex items-center gap-1 text-[11px] bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                @click="filterMode = 'unpinned'"
                :class="[
                  'px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer',
                  filterMode === 'unpinned'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800',
                ]"
              >
                Non placés ({{ unpinnedCount }})
              </button>
              <button
                type="button"
                @click="filterMode = 'all'"
                :class="[
                  'px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer',
                  filterMode === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800',
                ]"
              >
                Tous ({{ totalHospitalPlotsCount }})
              </button>
            </div>
          </div>

          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par numéro, nom, secteur..."
              class="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#002855] transition-colors"
            />
          </div>
        </div>

        <!-- Avertissement de déplacement si le local sélectionné est déjà placé -->
        <div
          v-if="selectedPlotPinInfo"
          class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2"
        >
          <i class="fa-solid fa-arrows-up-down-left-right text-amber-600 mt-0.5 shrink-0"></i>
          <div>
            <span class="font-bold">Déplacement d'emplacement :</span>
            <span>
              Ce local possède déjà un pin positionné{{ selectedPlotPinInfo.isCurrentEtage ? ' sur cet étage' : ` sur l'étage "${selectedPlotPinInfo.etageNom}"` }}. En confirmant, son pin sera déplacé à ces nouvelles coordonnées.
            </span>
          </div>
        </div>

        <!-- Liste des emplacements -->
        <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
          <div
            v-for="plot in displayedPlots"
            :key="plot.id"
            @click="selectedPlotId = plot.id"
            :class="[
              'p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3',
              selectedPlotId === plot.id
                ? 'border-[#002855] bg-blue-50/60 ring-2 ring-[#002855]/30'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50',
            ]"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-slate-900">
                  {{ plot.no_local_pavillon || plot.name || `Emplacement #${plot.id}` }}
                </span>
                <span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                  {{ plot.sector || plot.type_lieu || 'Local' }}
                </span>

                <!-- Badge statut pin (déjà placé ou non) -->
                <span
                  v-if="getPinInfo(plot.id)"
                  class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"
                >
                  <i class="fa-solid fa-location-pin text-[8px]"></i>
                  <span>{{ getPinInfo(plot.id).isCurrentEtage ? 'Déjà sur cet étage' : `Placé (${getPinInfo(plot.id).etageNom})` }}</span>
                </span>
                <span
                  v-else
                  class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                >
                  <i class="fa-solid fa-circle-plus text-[8px]"></i>
                  <span>Non positionné</span>
                </span>
              </div>
              <p class="text-[11px] text-slate-500 line-clamp-1">
                {{ plot.lieu_specifique || plot.description || 'Aucune description' }}
              </p>
            </div>

            <div class="text-right shrink-0">
              <span v-if="plot.price" class="font-bold text-[#002855] text-xs">
                {{ plot.formattedPrice || `${plot.price} $` }}
              </span>
              <div v-if="selectedPlotId === plot.id" class="text-emerald-600 text-[11px] font-bold flex items-center gap-1 justify-end">
                <i class="fa-solid fa-circle-check"></i>
                <span>Choisi</span>
              </div>
            </div>
          </div>

          <div
            v-if="displayedPlots.length === 0"
            class="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4"
          >
            <i class="fa-solid fa-building-circle-check text-slate-300 text-2xl mb-1 block"></i>
            <span>Aucun local correspondant à votre sélection.</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2.5">
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
          @click="submitPin"
          :disabled="!selectedPlotId || isSubmitting"
          class="px-4 py-2 bg-[#002855] hover:bg-[#001e40] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="isSubmitting" class="fa-solid fa-circle-notch fa-spin"></i>
          <i v-else class="fa-solid fa-location-dot"></i>
          <span>{{ isSubmitting ? 'Enregistrement...' : selectedPlotPinInfo ? 'Déplacer ici' : 'Confirmer le placement' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePlotsStore } from '../stores/plots.js'
import { useEtagesStore } from '../stores/etages.js'
import { useToastStore } from '../stores/toast.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  etage: { type: Object, default: null },
  hospitalCode: { type: String, default: '' },
  coords: { type: Object, default: () => ({ x: 0.5, y: 0.5 }) },
})

const emit = defineEmits(['close', 'created'])

let plotsStore
try {
  plotsStore = usePlotsStore()
} catch {
  plotsStore = { plots: [] }
}

let etagesStore
try {
  etagesStore = useEtagesStore()
} catch {
  etagesStore = { createPin: async () => {}, etages: [] }
}

let toastStore
try {
  toastStore = useToastStore()
} catch {
  toastStore = { show: () => {} }
}

const searchQuery = ref('')
const selectedPlotId = ref(null)
const filterMode = ref('all')
const isSubmitting = ref(false)
const errorMessage = ref('')

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      selectedPlotId.value = null
      searchQuery.value = ''
      errorMessage.value = ''
    }
  },
)

// Détecter l'ensemble des pins déjà positionnés sur cet hôpital à travers tous les étages
const pinnedMap = computed(() => {
  const map = new Map()
  const allEtages = Array.isArray(etagesStore.etages) ? etagesStore.etages : []
  for (const e of allEtages) {
    if (Array.isArray(e.pins)) {
      for (const p of e.pins) {
        const empId = Number(p.emplacement_id || p.id)
        if (empId) {
          map.set(empId, {
            etageId: e.id,
            etageNom: e.nom,
            isCurrentEtage: Number(e.id) === Number(props.etage?.id),
          })
        }
      }
    }
  }
  return map
})

function getPinInfo(plotId) {
  return pinnedMap.value.get(Number(plotId)) || null
}

const selectedPlotPinInfo = computed(() => {
  if (!selectedPlotId.value) return null
  return getPinInfo(selectedPlotId.value)
})

const hospitalPlots = computed(() => {
  const plots = plotsStore.plots || []
  return plots.filter((plot) => {
    if (plot.hospital && props.hospitalCode && plot.hospital !== props.hospitalCode) {
      return false
    }
    return true
  })
})

const totalHospitalPlotsCount = computed(() => hospitalPlots.value.length)

const unpinnedCount = computed(() => {
  return hospitalPlots.value.filter((p) => !pinnedMap.value.has(Number(p.id))).length
})

const displayedPlots = computed(() => {
  return hospitalPlots.value.filter((plot) => {
    // Filtre par mode (non placés seulement ou tous)
    if (filterMode.value === 'unpinned' && pinnedMap.value.has(Number(plot.id))) {
      return false
    }

    // Filtre par recherche texte
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchNo = (plot.no_local_pavillon || '').toLowerCase().includes(q)
      const matchName = (plot.name || '').toLowerCase().includes(q)
      const matchLieu = (plot.lieu_specifique || '').toLowerCase().includes(q)
      const matchSector = (plot.sector || plot.type_lieu || '').toLowerCase().includes(q)
      if (!matchNo && !matchName && !matchLieu && !matchSector) {
        return false
      }
    }

    return true
  })
})

function formatCoord(val) {
  if (typeof val !== 'number') return '0%'
  return `${Math.round(val * 1000) / 10}%`
}

async function submitPin() {
  if (!selectedPlotId.value || !props.etage?.id) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const isMoving = Boolean(selectedPlotPinInfo.value)
    const newPin = await etagesStore.createPin(
      props.etage.id,
      selectedPlotId.value,
      props.coords.x,
      props.coords.y,
    )
    toastStore.show(
      isMoving
        ? 'Emplacement déplacé à ces nouvelles coordonnées.'
        : 'Emplacement positionné avec succès sur le plan.',
    )
    emit('created', newPin)
    emit('close')
  } catch (err) {
    // Traduire / formater les messages pour éviter tout message brut de BD
    if (err.message && err.message.includes('contrainte unique')) {
      errorMessage.value = 'Cet emplacement est déjà positionné sur un plan.'
    } else {
      errorMessage.value = err.message || 'Erreur lors du placement du pin'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
