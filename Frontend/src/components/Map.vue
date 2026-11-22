<template>
  <section class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col gap-6">
    <!-- En-tête de la carte -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-[#002855]/10 border border-[#002855]/20 flex items-center justify-center text-[#002855]">
            <i class="fa-solid fa-map-location-dot text-sm"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 tracking-tight">
              Carte des sites & Plans d'étages
            </h3>
            <p class="text-xs text-slate-500">
              Réseau hospitalier du CHU de Québec &bull; Université Laval
            </p>
          </div>
        </div>
      </div>

      <!-- Contrôles d'état / Zoom -->
      <div class="flex items-center gap-2 flex-wrap">
        <template v-if="activeHospital">
          <div class="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <span>Site ciblé : <strong>{{ activeHospital }}</strong></span>
            <button
              @click="resetSelection"
              class="ml-1 text-blue-700 hover:text-blue-950 hover:bg-blue-100 p-0.5 rounded cursor-pointer"
              title="Désélectionner"
            >
              ✕
            </button>
          </div>
          <button
            @click="resetSelection"
            class="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Revenir à la vue générale de Québec"
          >
            <i class="fa-solid fa-earth-americas text-[#002855] text-xs"></i>
            <span>Vue globale de Québec</span>
          </button>
        </template>
        <template v-else>
          <span class="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <i class="fa-solid fa-location-dot text-[#002855] text-xs"></i>
            <span>{{ hospitals.length }} sites à Québec</span>
          </span>
        </template>
      </div>
    </div>

    <!-- 1. Carte géographique Leaflet permanente (Québec) -->
    <div class="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      <div
        ref="mapContainer"
        class="w-full h-[380px] z-0"
      ></div>

      <!-- Bouton reset flottant si zoomé -->
      <button
        v-if="activeHospital"
        @click="resetSelection"
        class="absolute top-3 right-3 z-[400] bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        title="Dézoomer"
      >
        <i class="fa-solid fa-magnifying-glass-minus text-[#002855]"></i>
        <span>Vue globale</span>
      </button>
    </div>

    <!-- 2. Panneau du plan d'étage (affiché sous la carte quand un hôpital est sélectionné) -->
    <div v-if="activeHospital">
      <FloorPlanView
        :hospital-code="activeHospital"
        :hospital-info="activeHospitalInfo"
        :etages="etagesStore.etages"
        :current-etage="etagesStore.currentEtage"
        :selected-pin="etagesStore.selectedPin"
        :date-range="dateRange"
        @update:date-range="$emit('update:date-range', $event)"
        @select-etage="etagesStore.selectEtage"
        @select-pin="etagesStore.selectPin"
        @view-plot="handlePlotSelect"
        @close="resetSelection"
      />
    </div>

    <!-- 3. Grille des cartes des 4 hôpitaux -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
          Sélectionner un établissement hospitalier
        </span>
        <button
          v-if="activeHospital"
          @click="resetSelection"
          class="text-xs font-bold text-[#002855] hover:underline cursor-pointer"
        >
          Voir tous les sites
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          v-for="hospital in hospitals"
          :key="hospital.code"
          type="button"
          @click="selectHospital(hospital.code)"
          :class="[
            'text-left rounded-xl border transition-all cursor-pointer overflow-hidden flex flex-col justify-between bg-white',
            activeHospital === hospital.code
              ? 'border-[#002855] ring-2 ring-[#002855]/20 shadow-sm'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-xs',
          ]"
        >
          <!-- Image supérieure -->
          <div class="relative h-28 w-full overflow-hidden bg-slate-100">
            <img
              :src="hospital.image"
              :alt="hospital.name"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div class="absolute top-2 left-2 flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded-md bg-[#002855] text-white text-[11px] font-bold shadow-xs">
                {{ hospital.code }}
              </span>
            </div>
            <div
              v-if="activeHospital === hospital.code"
              class="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1"
            >
              <i class="fa-solid fa-check text-[9px]"></i>
              <span>Sélectionné</span>
            </div>
          </div>

          <!-- Contenu descriptif -->
          <div class="p-3.5 flex-1 flex flex-col justify-between gap-2">
            <div>
              <h4 class="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                {{ hospital.shortName || hospital.name }}
              </h4>
              <p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {{ hospital.specialty }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
              <span class="text-slate-500 font-medium">
                {{ hospital.city }}
              </span>
              <span class="font-bold text-[#002855]">
                {{ getPlotsCount(hospital.code) }} espaces
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import FloorPlanView from './FloorPlanView.vue'
import { usePlotsStore } from '../stores/plots.js'
import { useEtagesStore } from '../stores/etages.js'

const props = defineProps({
  hospitals: { type: Array, required: true },
  pins: { type: Array, default: () => [] },
  activeHospital: { type: String, default: '' },
  searchQuery: { type: String, default: '' },
  dateRange: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-hospital', 'update:searchQuery', 'update:date-range', 'select-plot'])

const plotsStore = usePlotsStore()
const etagesStore = useEtagesStore()

const mapContainer = ref(null)
let map = null
let markers = {}
let resizeObserver = null

// Coordonnées géographiques réelles à Québec
const HOSPITAL_GEO = {
  CHUL: {
    lat: 46.7725,
    lng: -71.2785,
    name: "CHUL (Centre hospitalier de l'Université Laval)",
    address: '2705 Boulevard Laurier, Québec',
    zoom: 15.5,
  },
  NCH: {
    lat: 46.837,
    lng: -71.229,
    name: 'Nouveau complexe hospitalier (NCH)',
    address: '1825 Boulevard Henri-Bourassa, Québec',
    zoom: 15.5,
  },
  HSFA: {
    lat: 46.8322,
    lng: -71.2372,
    name: "Hôpital Saint-François d'Assise (HSFA)",
    address: "10 Rue de l'Espinay, Québec",
    zoom: 15.5,
  },
  HSS: {
    lat: 46.7972,
    lng: -71.2547,
    name: 'Hôpital du Saint-Sacrement (HSS)',
    address: '1050 Chemin Sainte-Foy, Québec',
    zoom: 15.5,
  },
}

const QUEBEC_CENTER = [46.818, -71.25]
const QUEBEC_DEFAULT_ZOOM = 12

const activeHospitalInfo = computed(() => {
  if (!props.activeHospital) return null
  return props.hospitals.find((h) => h.code === props.activeHospital) || { name: props.activeHospital }
})

function getPlotsCount(code) {
  if (!plotsStore.plots || !Array.isArray(plotsStore.plots)) return 0
  return plotsStore.plots.filter((p) => p.hospital === code).length
}

function buildMarkerHtml(code, isActive) {
  const bg = isActive ? '#002855' : '#1e293b'
  const border = isActive ? '#38bdf8' : '#ffffff'

  return `
    <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%); cursor:pointer;">
      <div style="
        display:flex; align-items:center; gap:5px;
        background: ${bg};
        color: white;
        padding: 4px 9px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 11px;
        font-family: inherit;
        border: 2px solid ${border};
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        white-space: nowrap;
      ">
        <i class="fa-solid fa-hospital" style="font-size: 10px; color: ${isActive ? '#7dd3fc' : '#94a3b8'};"></i>
        <span>${code}</span>
      </div>
      <div style="
        width: 0; height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid ${border};
        margin-top: -1px;
      "></div>
    </div>
  `
}

function updateMarkerIcons() {
  for (const code of Object.keys(markers)) {
    const isActive = props.activeHospital === code
    const icon = L.divIcon({
      className: 'custom-hospital-marker',
      html: buildMarkerHtml(code, isActive),
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -32],
    })
    markers[code].setIcon(icon)
    markers[code].setZIndexOffset(isActive ? 1000 : 0)
  }
}

function initMap() {
  if (!mapContainer.value) return
  destroyMap()

  map = L.map(mapContainer.value, {
    center: QUEBEC_CENTER,
    zoom: QUEBEC_DEFAULT_ZOOM,
    zoomControl: true,
  })

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributeurs',
  }).addTo(map)

  props.hospitals.forEach((hospital) => {
    const geo = HOSPITAL_GEO[hospital.code]
    if (!geo) return

    const icon = L.divIcon({
      className: 'custom-hospital-marker',
      html: buildMarkerHtml(hospital.code, props.activeHospital === hospital.code),
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -32],
    })

    const marker = L.marker([geo.lat, geo.lng], { icon }).addTo(map)
    const count = getPlotsCount(hospital.code)

    const popupHtml = `
      <div style="padding: 2px; font-family: inherit; font-size: 12px;">
        <strong style="color: #002855; font-size: 13px;">${hospital.shortName || hospital.name}</strong>
        <p style="color: #64748b; margin: 2px 0 6px 0; font-size: 11px;">${geo.address}</p>
        <span style="font-weight: bold; color: #059669;">${count} espaces disponibles</span>
      </div>
    `
    marker.bindPopup(popupHtml)

    marker.on('click', () => {
      selectHospital(hospital.code)
    })

    markers[hospital.code] = marker
  })

  if (window.ResizeObserver && mapContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      map?.invalidateSize()
    })
    resizeObserver.observe(mapContainer.value)
  }

  nextTick(() => {
    setTimeout(() => {
      map?.invalidateSize()
      if (props.activeHospital && HOSPITAL_GEO[props.activeHospital]) {
        flyToHospital(props.activeHospital)
      }
    }, 200)
  })
}

function destroyMap() {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (map) {
    try {
      map.off()
      map.remove()
    } catch {}
    map = null
  }
  if (mapContainer.value && mapContainer.value._leaflet_id) {
    delete mapContainer.value._leaflet_id
  }
  markers = {}
}

function flyToHospital(code) {
  if (!map) return
  const geo = HOSPITAL_GEO[code]
  if (geo) {
    map.flyTo([geo.lat, geo.lng], geo.zoom || 15.5, { duration: 1.2 })
  }
}

function flyToDefault() {
  if (!map) return
  map.closePopup()
  map.flyTo(QUEBEC_CENTER, QUEBEC_DEFAULT_ZOOM, { duration: 1.2 })
}

function selectHospital(code) {
  if (props.activeHospital === code) {
    resetSelection()
  } else {
    emit('select-hospital', code)
    etagesStore.fetchEtagesByHospital(code)
    flyToHospital(code)
    updateMarkerIcons()
  }
}

function resetSelection() {
  emit('select-hospital', '')
  flyToDefault()
  updateMarkerIcons()
}

function handlePlotSelect(plotId) {
  emit('select-plot', plotId)
}

watch(
  () => props.activeHospital,
  (newVal) => {
    updateMarkerIcons()
    if (newVal) {
      etagesStore.fetchEtagesByHospital(newVal)
      if (HOSPITAL_GEO[newVal]) {
        flyToHospital(newVal)
      }
    } else {
      flyToDefault()
    }
  }
)

onMounted(() => {
  initMap()
  if (props.activeHospital) {
    etagesStore.fetchEtagesByHospital(props.activeHospital)
  }
})

onBeforeUnmount(() => {
  destroyMap()
})
</script>

<style>
.leaflet-popup-content-wrapper {
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #e2e8f0;
}
</style>
