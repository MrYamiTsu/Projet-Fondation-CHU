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
          Sélectionnez un étage pour visualiser les emplacements et leur disponibilité sur le plan
        </p>
      </div>

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

      <!-- Légende statut -->
      <div class="text-xs text-slate-500 font-medium flex items-center gap-3">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Disponible</span>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          <span>Réservé</span>
        </span>
      </div>
    </div>

    <!-- Plan d'étage avec l'image réelle et les pins positionnés -->
    <div
      v-if="currentEtage"
      class="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[400px]"
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
              'w-2 h-2 rounded-full shrink-0',
              pin.statut === 'Disponible' ? 'bg-emerald-500' : 'bg-slate-400',
            ]"
          ></span>
          <span class="text-xs font-bold tracking-tight whitespace-nowrap">
            {{ pin.no_local_pavillon || pin.lieu_specifique }}
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
        <div class="space-y-0.5">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-slate-700">{{ selectedPin.no_local_pavillon }}</span>
            <span
              :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded',
                selectedPin.statut === 'Disponible'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700',
              ]"
            >
              {{ selectedPin.statut }}
            </span>
            <span class="text-xs text-slate-400">&bull;</span>
            <span class="text-xs text-slate-600">{{ selectedPin.type_lieu }}</span>
            <span v-if="selectedPin.superficie" class="text-xs text-slate-400">&bull; {{ selectedPin.superficie }} m²</span>
          </div>
          <h4 class="text-sm font-bold text-slate-900">
            {{ selectedPin.lieu_specifique || selectedPin.description }}
          </h4>
          <p v-if="selectedPin.description" class="text-xs text-slate-500">
            {{ selectedPin.description }}
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
          type="button"
          @click="viewPlotDetails(selectedPin)"
          class="px-3.5 py-2 rounded-lg bg-[#002855] hover:bg-[#001e40] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <span>Consulter la fiche</span>
          <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  hospitalCode: { type: String, required: true },
  hospitalInfo: { type: Object, default: () => ({}) },
  etages: { type: Array, default: () => [] },
  currentEtage: { type: Object, default: null },
  selectedPin: { type: Object, default: null },
})

const emit = defineEmits(['select-etage', 'select-pin', 'view-plot', 'close'])

const currentPins = computed(() => {
  if (!props.currentEtage || !Array.isArray(props.currentEtage.pins)) return []
  return props.currentEtage.pins
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
</script>
