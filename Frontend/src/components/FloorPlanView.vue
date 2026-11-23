<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
    <!-- En-tête du panneau d'étage -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-md bg-[#002855] text-white text-xs font-black tracking-wider">
            {{ hospitalCode }}
          </span>
          <h3 class="text-base sm:text-lg font-bold text-slate-900">
            Plans d'étages & Locaux &bull; {{ hospitalInfo?.shortName || hospitalInfo?.name || hospitalCode }}
          </h3>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          Visualisez les emplacements et leur disponibilité dynamique selon votre période souhaitée
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-if="authStore?.isAdmin && currentEtage?.image_url"
          type="button"
          @click="togglePinPlacementMode"
          :class="[
            'self-start sm:self-center px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs',
            isPinPlacementModeActive
              ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-400/50'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white',
          ]"
          :title="isPinPlacementModeActive ? 'Quitter le mode placement' : 'Positionner un local sur le plan (Admin)'"
        >
          <i class="fa-solid fa-location-dot text-xs"></i>
          <span>{{ isPinPlacementModeActive ? 'Annuler placement' : 'Placer un pin' }}</span>
        </button>

        <button
          v-if="authStore?.isAdmin"
          type="button"
          @click="isImageModalOpen = true"
          class="self-start sm:self-center px-3 py-1.5 rounded-lg bg-[#002855] hover:bg-[#001e40] text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
          title="Modifier le plan d'étage (Admin)"
        >
          <i class="fa-solid fa-cloud-arrow-up text-xs"></i>
          <span>Modifier le plan</span>
        </button>

        <button
          type="button"
          @click="$emit('close')"
          class="self-start sm:self-center px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          title="Fermer le plan d'étage"
        >
          <span>Fermer le plan</span>
          <i class="fa-solid fa-xmark text-slate-400"></i>
        </button>
      </div>
    </div>

    <!-- Barre d'actions : Filtre par dates & Légende dynamique -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
      <div class="flex items-center gap-2 flex-wrap flex-1">
        <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <i class="fa-regular fa-calendar-days text-[#002855]"></i>
          <span>Période :</span>
        </span>

        <div class="w-full sm:w-72">
          <VueDatePicker
            v-model="dateRangeModel"
            :range="{ noDisabledRange: false, partialRange: false }"
            :time-config="{ enableTimePicker: false }"
            :enable-time-picker="false"
            :format="formatRange"
            :min-date="today"
            placeholder="Sélectionner des dates..."
            auto-apply
            :clearable="true"
          />
        </div>

        <button
          v-if="hasDateRange"
          type="button"
          @click="clearDateRange"
          class="text-xs text-slate-500 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200/60"
          title="Effacer la période"
        >
          <i class="fa-solid fa-rotate-left text-[10px]"></i>
          <span>Effacer dates</span>
        </button>
      </div>

      <!-- Légende dynamique -->
      <div class="text-xs text-slate-600 font-medium flex items-center gap-3 shrink-0">
        <template v-if="hasDateRange">
          <span class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
            <span class="font-semibold text-emerald-800">Disponible</span>
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
            <span class="font-semibold text-rose-800">Occupé sur ces dates</span>
          </span>
        </template>
        <template v-else>
          <span class="flex items-center gap-1.5 text-slate-500">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span>Disponibilité selon dates (choisir une période)</span>
          </span>
        </template>
      </div>
    </div>

    <!-- Sélecteur des étages (Onglets) -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
          Niveau :
        </span>
        <button
          v-for="etage in etages"
          :key="etage.id"
          type="button"
          @click="selectEtage(etage)"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-2',
            currentEtage?.id === etage.id
              ? 'bg-[#002855] text-white border-[#002855] shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
          ]"
        >
          <span>{{ etage.nom }}</span>
          <span
            v-if="etage.pins && etage.pins.length > 0"
            :class="[
              'text-[10px] font-bold px-1.5 py-0.2 rounded-full',
              currentEtage?.id === etage.id
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600',
            ]"
          >
            {{ etage.pins.length }}
          </span>
        </button>
      </div>

      <!-- Résumé du nombre disponible si des dates sont actives -->
      <div v-if="hasDateRange && currentPins.length > 0" class="text-xs font-semibold text-slate-600">
        <span class="text-emerald-700 font-bold">{{ availablePinsCount }}</span> / {{ currentPins.length }} disponibles sur cette période
      </div>
    </div>

    <!-- Bannière informative si le mode placement de pin est actif -->
    <div
      v-if="isPinPlacementModeActive"
      class="bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs"
    >
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0"></span>
        <span class="font-bold">Mode placement actif :</span>
        <span>Cliquez directement sur l'image du plan ci-dessous à l'endroit exact où vous souhaitez positionner un local.</span>
      </div>
      <button
        type="button"
        @click="isPinPlacementModeActive = false"
        class="self-start sm:self-center px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg font-bold text-amber-950 transition-colors cursor-pointer text-[11px]"
      >
        Quitter le mode
      </button>
    </div>

    <!-- Plan d'étage avec l'image réelle et les pins positionnés -->
    <div
      v-if="currentEtage"
      ref="planContainer"
      @click="handlePlanClick"
      :class="[
        'relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[400px]',
        isPinPlacementModeActive ? 'cursor-crosshair ring-2 ring-amber-400' : '',
      ]"
    >
      <!-- Image réelle de l'étage (Cloudinary ou local) -->
      <img
        v-if="currentEtage.image_url"
        :src="currentEtage.image_url"
        :alt="currentEtage.nom"
        class="w-full max-h-[550px] object-contain select-none block"
        loading="lazy"
      />
      <!-- Grille neutre si aucune image n'est encore configurée -->
      <div
        v-else
        class="w-full h-[450px] map-grid bg-slate-50 select-none"
      ></div>

      <!-- Pins positionnés sur l'image ou la grille -->
      <div
        v-for="pin in currentPins"
        :key="pin.id"
        @click="handlePinClick(pin)"
        :style="{
          left: `${pin.x * 100}%`,
          top: `${pin.y * 100}%`,
        }"
        :class="[
          'absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 z-20 group select-none',
          selectedPin?.id === pin.id ? 'scale-110 z-30' : 'hover:scale-105',
        ]"
      >
        <div
          :class="[
            'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border shadow-md font-sans transition-all',
            selectedPin?.id === pin.id
              ? 'bg-[#002855] text-white border-blue-400 ring-2 ring-blue-400/40 shadow-lg'
              : 'bg-white text-slate-900 border-slate-300 hover:border-[#002855]',
          ]"
        >
          <span
            :class="[
              'w-2.5 h-2.5 rounded-full shrink-0 transition-colors',
              getPinStatus(pin).dotClass,
            ]"
          ></span>
          <span class="text-xs font-bold tracking-tight whitespace-nowrap">
            {{ pin.no_local_pavillon || pin.lieu_specifique }}
          </span>
          <span
            v-if="hasDateRange"
            :class="[
              'text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase',
              getPinStatus(pin).isAvailable
                ? selectedPin?.id === pin.id ? 'bg-emerald-400/30 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                : selectedPin?.id === pin.id ? 'bg-rose-400/30 text-rose-200' : 'bg-rose-100 text-rose-800',
            ]"
          >
            {{ getPinStatus(pin).shortLabel }}
          </span>
        </div>
      </div>
    </div>

    <!-- Détail de l'emplacement sélectionné sur le plan -->
    <div
      v-if="selectedPin"
      class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-lg bg-[#002855] text-white flex items-center justify-center text-sm shrink-0 mt-0.5">
          <i class="fa-solid fa-hospital-user"></i>
        </div>
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-slate-700">{{ selectedPin.no_local_pavillon }}</span>
            <span
              :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded border',
                getPinStatus(selectedPin).badgeClass,
              ]"
            >
              {{ getPinStatus(selectedPin).label }}
            </span>
            <span class="text-xs text-slate-400">&bull;</span>
            <span class="text-xs text-slate-600">{{ selectedPin.type_lieu }}</span>
            <span v-if="selectedPin.superficie" class="text-xs text-slate-400">&bull; {{ selectedPin.superficie }} m²</span>
          </div>
          <h4 class="text-sm font-bold text-slate-900">
            {{ selectedPin.lieu_specifique || selectedPin.description }}
          </h4>
          <p class="text-xs text-slate-500">
            {{ getPinStatus(selectedPin).detailMessage }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
        <div v-if="selectedPin.valeur_toponymique" class="text-right">
          <p class="text-[10px] text-slate-400 font-semibold uppercase">Valeur</p>
          <p class="text-sm font-bold text-slate-900">
            {{ formatPrice(selectedPin.valeur_toponymique) }}
          </p>
        </div>
        <button
          v-if="authStore?.isAdmin"
          type="button"
          @click="confirmDeletePin(selectedPin)"
          :disabled="isDeletingPin"
          class="px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          title="Supprimer ce pin (Admin)"
        >
          <i class="fa-solid fa-trash-can text-[11px]"></i>
          <span>Supprimer ce pin</span>
        </button>

        <button
          type="button"
          @click="viewPlotDetails(selectedPin)"
          class="px-3.5 py-2 rounded-lg bg-[#002855] hover:bg-[#001e40] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <span>Consulter la fiche</span>
          <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Modal d'administration de l'image de plan -->
    <EtageImageModal
      :is-open="isImageModalOpen"
      :etage="currentEtage"
      :hospital-name="hospitalInfo?.shortName || hospitalInfo?.name || hospitalCode"
      @close="isImageModalOpen = false"
    />

    <!-- Modal d'association d'un emplacement à un pin -->
    <PinPlacementModal
      :is-open="isPinPlacementModalOpen"
      :etage="currentEtage"
      :hospital-code="hospitalCode"
      :coords="pendingPinCoords"
      @close="isPinPlacementModalOpen = false"
      @created="handlePinCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import EtageImageModal from './EtageImageModal.vue'
import PinPlacementModal from './PinPlacementModal.vue'
import { useReservationStore } from '../stores/reservations.js'
import { useAuthStore } from '../stores/auth.js'
import { useEtagesStore } from '../stores/etages.js'
import { useToastStore } from '../stores/toast.js'

const props = defineProps({
  hospitalCode: { type: String, required: true },
  hospitalInfo: { type: Object, default: () => ({}) },
  etages: { type: Array, default: () => [] },
  currentEtage: { type: Object, default: null },
  selectedPin: { type: Object, default: null },
  dateRange: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-etage', 'select-pin', 'view-plot', 'close', 'update:date-range'])

const planContainer = ref(null)
const isImageModalOpen = ref(false)
const isPinPlacementModeActive = ref(false)
const isPinPlacementModalOpen = ref(false)
const pendingPinCoords = ref({ x: 0.5, y: 0.5 })
const isDeletingPin = ref(false)

let authStore
try {
  authStore = useAuthStore()
} catch {
  authStore = { isAdmin: false }
}

let etagesStore
try {
  etagesStore = useEtagesStore()
} catch {
  etagesStore = { deletePin: async () => {} }
}

let toastStore
try {
  toastStore = useToastStore()
} catch {
  toastStore = { show: () => {} }
}

let reservationStore
try {
  reservationStore = useReservationStore()
} catch {
  reservationStore = {
    allConfirmedReservations: [],
    getAllConfirmedReservations: () => {},
    formatDate: (d) => (d ? new Date(d).toISOString().slice(0, 10) : ''),
    isEmplacementAvailable: () => true,
  }
}
const today = new Date()

onMounted(() => {
  if (reservationStore.allConfirmedReservations.length === 0) {
    reservationStore.getAllConfirmedReservations()
  }
})

const dateRangeModel = computed({
  get: () => props.dateRange,
  set: (val) => emit('update:date-range', val || []),
})

const hasDateRange = computed(() => {
  return (
    Array.isArray(props.dateRange) &&
    Boolean(props.dateRange[0]) &&
    Boolean(props.dateRange[1])
  )
})

const currentPins = computed(() => {
  if (!props.currentEtage || !Array.isArray(props.currentEtage.pins)) return []
  return props.currentEtage.pins
})

function formatRange(dates) {
  if (!dates || !dates[0]) return ''
  const start = dates[0].toLocaleDateString('fr-CA', { day: '2-digit', month: 'short', year: 'numeric' })
  if (!dates[1]) return start
  const end = dates[1].toLocaleDateString('fr-CA', { day: '2-digit', month: 'short', year: 'numeric' })
  return `${start} - ${end}`
}

function clearDateRange() {
  emit('update:date-range', [])
}

function getPinStatus(pin) {
  const emplacementId = pin.emplacement_id || pin.id

  if (!hasDateRange.value) {
    return {
      type: 'pending_dates',
      label: 'Disponibilité selon dates',
      shortLabel: 'Selon dates',
      dotClass: 'bg-slate-400 group-hover:bg-[#002855]',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      isAvailable: null,
      detailMessage: 'La disponibilité dépend de la période choisie. Sélectionnez des dates pour vérifier si cet emplacement est libre.',
    }
  }

  const startDateStr = reservationStore.formatDate(props.dateRange[0])
  const endDateStr = reservationStore.formatDate(props.dateRange[1])
  const available = reservationStore.isEmplacementAvailable(emplacementId, startDateStr, endDateStr)

  if (available) {
    return {
      type: 'available',
      label: 'Disponible sur cette période',
      shortLabel: 'Disponible',
      dotClass: 'bg-emerald-500',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      isAvailable: true,
      detailMessage: `Cet emplacement est disponible pour la période sélectionnée (${startDateStr} au ${endDateStr}).`,
    }
  } else {
    return {
      type: 'reserved',
      label: 'Occupé / Réservé',
      shortLabel: 'Occupé',
      dotClass: 'bg-rose-500',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      isAvailable: false,
      detailMessage: `Cet emplacement fait déjà l'objet d'une réservation confirmée durant la période du ${startDateStr} au ${endDateStr}.`,
    }
  }
}

const availablePinsCount = computed(() => {
  if (!hasDateRange.value) return currentPins.value.length
  return currentPins.value.filter((p) => getPinStatus(p).isAvailable).length
})

function selectEtage(etage) {
  emit('select-etage', etage.id)
}

function handlePinClick(pin) {
  emit('select-pin', pin)
}

function viewPlotDetails(pin) {
  emit('view-plot', pin.emplacement_id || pin.id)
}

function formatPrice(amount) {
  return `${new Intl.NumberFormat('fr-CA').format(amount)} $ CAD`
}

function togglePinPlacementMode() {
  isPinPlacementModeActive.value = !isPinPlacementModeActive.value
}

function handlePlanClick(event) {
  if (!isPinPlacementModeActive.value) return
  const container = planContainer.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return

  const clickX = (event.clientX - rect.left) / rect.width
  const clickY = (event.clientY - rect.top) / rect.height

  pendingPinCoords.value = {
    x: Math.max(0, Math.min(1, Math.round(clickX * 1000) / 1000)),
    y: Math.max(0, Math.min(1, Math.round(clickY * 1000) / 1000)),
  }

  isPinPlacementModalOpen.value = true
}

function handlePinCreated() {
  isPinPlacementModeActive.value = false
  isPinPlacementModalOpen.value = false
}

async function confirmDeletePin(pin) {
  if (!pin?.id) return
  const confirmed = window.confirm(
    `Êtes-vous sûr de vouloir supprimer le pin pour "${pin.no_local_pavillon || pin.lieu_specifique || 'cet emplacement'}" ?`,
  )
  if (!confirmed) return

  isDeletingPin.value = true
  try {
    await etagesStore.deletePin(pin.id)
    toastStore.show('Pin supprimé du plan avec succès.')
  } catch (err) {
    alert(err.message || 'Erreur lors de la suppression du pin')
  } finally {
    isDeletingPin.value = false
  }
}
</script>
