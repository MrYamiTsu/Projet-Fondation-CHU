<template>
  <div>
    <Header
      :current-user="authStore.currentUser"
      @open-auth="isAuthModalOpen = true"
      @logout="authStore.logout"
    >
      <template #auth>
        <Auth
          :is-open="isAuthModalOpen"
          :users="authStore.users"
          @close="isAuthModalOpen = false"
        />
      </template>
    </Header>
  </div>

  <div
    v-if="plotsStore.isLoading && !plot"
    class="min-h-screen flex flex-col items-center justify-center text-slate-500 gap-3"
  >
    <i class="fa-solid fa-circle-notch fa-spin text-3xl text-teal-600"></i>
    <p class="text-sm font-medium">Chargement des détails de l'emplacement...</p>
  </div>

  <div v-else-if="plot" class="bg-white min-h-screen">
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <!-- Barre supérieure : Bouton Retour et Fil d'Ariane -->
      <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-teal-600 transition-colors cursor-pointer group"
        >
          <i class="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          <span>Retour aux emplacements</span>
        </button>

        <!-- Fil d'Ariane -->
        <nav class="flex items-center gap-2 text-xs text-slate-400" aria-label="Fil d'Ariane">
          <router-link
            to="/#recherche"
            class="hover:text-teal-600 transition-colors hover:underline"
          >
            Accueil
          </router-link>
          <span>/</span>
          <button
            v-if="plot?.hospital"
            @click="navigateToHospital(plot.hospital)"
            class="hover:text-teal-600 font-medium transition-colors hover:underline cursor-pointer"
            :title="`Filtrer par l'hôpital ${plot.hospital}`"
          >
            {{ plot.hospital }}
          </button>
          <span v-if="plot?.hospital && plot?.sector">/</span>
          <button
            v-if="plot?.sector"
            @click="navigateToSector(plot.sector)"
            class="hover:text-teal-600 font-medium transition-colors hover:underline cursor-pointer"
            :title="`Filtrer par le secteur ${plot.sector}`"
          >
            {{ plot.sector }}
          </button>
          <span>/</span>
          <span class="text-slate-600 font-semibold truncate max-w-[200px] sm:max-w-[320px]">
            {{ plot?.name }}
          </span>
        </nav>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-6">
          <div class="relative rounded-2xl overflow-hidden h-[380px]">
            <img
              :src="plot.image"
              :alt="plot?.name || 'Image de l\'emplacement'"
              class="w-full h-full object-cover"
            />
            <span
              v-if="isRangeSelected"
              :class="[
                'absolute top-4 right-4 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-md backdrop-blur flex items-center gap-1.5',
                isAvailableForSelectedRange ? 'bg-emerald-600' : 'bg-red-600',
              ]"
            >
              <i :class="isAvailableForSelectedRange ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'"></i>
              <span>{{ isAvailableForSelectedRange ? 'Disponible pour ces dates' : 'Occupé pour ces dates' }}</span>
            </span>
            <span
              v-else
              class="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-md backdrop-blur flex items-center gap-1.5"
            >
              <i class="fa-solid fa-circle-check"></i>
              <span>Disponible à la location</span>
            </span>
          </div>

          <div>
            <p
              @click="navigateToHospital(plot.hospital)"
              class="text-sm font-semibold text-blue-600 uppercase tracking-wide cursor-pointer hover:underline inline-block"
              :title="`Filtrer par l'hôpital ${plot.hospital} sur la page principale`"
            >
              {{ plot?.hospital }}
            </p>
            <h1 class="text-3xl font-bold text-slate-900 mt-1">
              {{ plot?.name }}
            </h1>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <p class="text-sm text-slate-500">Secteur de soins</p>
              <p
                @click="navigateToSector(plot.sector)"
                class="text-base font-medium text-slate-800 cursor-pointer hover:underline inline-block hover:text-blue-600 transition-colors"
                :title="`Filtrer par le secteur ${plot.sector} sur la page principale`"
              >
                {{ plot?.sector }}
              </p>
            </div>
          </div>

          <div>
            <p class="text-sm text-slate-500">Description</p>
            <p class="text-base text-slate-800 mt-1">
              {{ plot?.description || 'Aucune description disponible pour cet emplacement.' }}
            </p>
          </div>

          <div class="border-t border-slate-200 pt-6">
            <h2 class="text-lg font-bold text-slate-900 mb-4">
              Détails de l'espace
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="border border-slate-200 rounded-xl p-4">
                <p class="text-sm text-slate-500">Dimensions</p>
                <p class="text-base font-semibold text-slate-800">
                  {{ plot?.dimensions || 'Dimensions non disponibles' }}
                </p>
              </div>
              <div class="border border-slate-200 rounded-xl p-4">
                <p class="text-sm text-slate-500">Valeur totale sur 15 ans</p>
                <p class="text-base font-semibold text-slate-800">
                  {{ plot?.valeur15ans || 'Valeur non disponible' }}
                </p>
              </div>
              <div class="border border-slate-200 rounded-xl p-4">
                <p class="text-sm text-slate-500">Achalandage</p>
                <p class="text-base font-semibold text-slate-800">
                  {{ plot?.achalandage || 'Achalandage non disponible' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="border border-slate-200 rounded-2xl p-6 sticky top-6 space-y-5 shadow-sm bg-white">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Valeur de l'espace</p>
              <p class="text-3xl font-black text-slate-900 font-mono mt-0.5">
                {{ plot?.formattedPrice || 'Prix non disponible' }}
              </p>
            </div>

            <!-- Section Disponibilité & Calendrier -->
            <div class="border-t border-slate-100 pt-4 space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <i class="fa-regular fa-calendar-days text-teal-600"></i>
                  <span>Vérifier les dates</span>
                </label>
                <span
                  v-if="isRangeSelected"
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    isAvailableForSelectedRange
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200',
                  ]"
                >
                  {{ isAvailableForSelectedRange ? 'Disponible' : 'Occupé' }}
                </span>
              </div>

              <div class="detail-datepicker-wrapper">
                <VueDatePicker
                  v-model="selectedRange"
                  :range="{ noDisabledRange: true, partialRange: false }"
                  :disabled-dates="disabledDates"
                  :time-config="{ enableTimePicker: false }"
                  :enable-time-picker="false"
                  :format="formatRange"
                  :min-date="today"
                  placeholder="Choisir des dates"
                  auto-apply
                  :clearable="true"
                />
              </div>

              <div
                v-if="isRangeSelected"
                class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70"
              >
                <div class="flex items-center justify-between font-medium">
                  <span>Durée souhaitée :</span>
                  <span class="font-bold text-slate-800">
                    {{ selectedDaysCount }} jour{{ selectedDaysCount > 1 ? 's' : '' }}
                  </span>
                </div>
                <div
                  v-if="!isAvailableForSelectedRange"
                  class="mt-1 text-red-600 text-[11px] font-medium flex items-center gap-1"
                >
                  <i class="fa-solid fa-triangle-exclamation"></i>
                  <span>Cet emplacement est déjà occupé sur cette période.</span>
                </div>
              </div>

              <!-- Résumé des disponibilités -->
              <div class="text-[11px] text-slate-500 space-y-1.5 bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                <p class="font-bold text-teal-900 flex items-center gap-1.5">
                  <i class="fa-solid fa-circle-info text-teal-600"></i>
                  <span>Statut des réservations</span>
                </p>
                <p v-if="reservationStore.reservedPeriods.length === 0">
                  Aucune réservation confirmée pour le moment. L'emplacement est libre immédiatement.
                </p>
                <div v-else class="space-y-1">
                  <p>
                    Première date libre :
                    <strong class="text-slate-800">
                      {{ firstAvailableDate.toLocaleDateString('fr-CA', { dateStyle: 'medium' }) }}
                    </strong>
                  </p>
                  <p class="text-[10px] text-slate-400">
                    {{ reservationStore.reservedPeriods.length }} période{{
                      reservationStore.reservedPeriods.length > 1 ? 's' : ''
                    }}
                    déjà réservée{{ reservationStore.reservedPeriods.length > 1 ? 's' : '' }} (dates grisées au calendrier).
                  </p>
                </div>
              </div>
            </div>

            <button
              @click="openPlotReserver"
              :disabled="isRangeSelected && !isAvailableForSelectedRange"
              class="w-full bg-[#0A1526] hover:bg-[#132238] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              <i class="fa-solid fa-calendar-check"></i>
              <span>{{ isRangeSelected && !isAvailableForSelectedRange ? 'Période occupée' : 'Réserver l\'emplacement' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen flex flex-col items-center justify-center text-slate-500 gap-4">
    <p class="text-base font-medium">Emplacement introuvable.</p>
    <button
      @click="goBack"
      class="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer"
    >
      <i class="fa-solid fa-arrow-left"></i>
      <span>Retour aux emplacements</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Auth from '../components/Auth.vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { usePlotsStore } from '../stores/plots.js'
import { useAuthStore } from '../stores/auth.js'
import { useReservationStore } from '../stores/reservations.js'

const route = useRoute()
const router = useRouter()
const plotsStore = usePlotsStore()
const authStore = useAuthStore()
const reservationStore = useReservationStore()

const isAuthModalOpen = ref(false)
const selectedRange = ref(null)
const today = new Date()

function formatDate(d) {
  return reservationStore.formatDate(d)
}

function formatRange(dates) {
  if (!dates) return ''
  const fmt = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  if (Array.isArray(dates)) {
    if (dates[0] && dates[1]) return `${fmt(dates[0])} au ${fmt(dates[1])}`
    if (dates[0]) return fmt(dates[0])
    return ''
  }
  return fmt(dates)
}

function initDatesFromQuery() {
  const start = route.query.startDate || route.query.start
  const end = route.query.endDate || route.query.end
  if (start && end) {
    const s = new Date(start + 'T00:00:00')
    const e = new Date(end + 'T00:00:00')
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      selectedRange.value = [s, e]
    }
  }
}

const plot = computed(() => {
  const id = Number(route.params.id)
  if (!id) return null
  if (plotsStore.plot && Number(plotsStore.plot.id) === id) {
    return plotsStore.plot
  }
  return plotsStore.plots.find((p) => Number(p.id) === id) || null
})

const isRangeSelected = computed(() => {
  return (
    Array.isArray(selectedRange.value) &&
    Boolean(selectedRange.value[0]) &&
    Boolean(selectedRange.value[1])
  )
})

const isAvailableForSelectedRange = computed(() => {
  if (!isRangeSelected.value || !plot.value) return true
  const startStr = formatDate(selectedRange.value[0])
  const endStr = formatDate(selectedRange.value[1])
  return !reservationStore.reservedPeriods.some(
    (period) => period.start <= endStr && period.end >= startStr
  )
})

const selectedDaysCount = computed(() => {
  if (!isRangeSelected.value) return 0
  const diff = selectedRange.value[1] - selectedRange.value[0]
  return Math.round(diff / 86_400_000) + 1
})

const disabledDates = computed(() => {
  return (date) => {
    const dStr = formatDate(date)
    return reservationStore.reservedPeriods.some(
      (period) => dStr >= period.start && dStr <= period.end
    )
  }
})

const firstAvailableDate = computed(() => {
  const candidate = new Date(today)
  candidate.setHours(0, 0, 0, 0)
  const periods = [...reservationStore.reservedPeriods].sort((a, b) =>
    a.start.localeCompare(b.start)
  )
  for (const period of periods) {
    const day = formatDate(candidate)
    if (period.start > day) break
    if (period.end >= day) {
      const [year, month, lastDay] = period.end.split('-').map(Number)
      candidate.setFullYear(year, month - 1, lastDay + 1)
    }
  }
  return candidate
})

async function loadPlotAndReservations() {
  const id = Number(route.params.id)
  if (!isNaN(id) && id > 0) {
    await plotsStore.getPlotById(id)
    try {
      await reservationStore.getReservedPeriods(id)
    } catch {
      // Ignoré si indisponible
    }
  }
}

onMounted(async () => {
  initDatesFromQuery()
  if (plotsStore.plots.length === 0) {
    plotsStore.getPlots()
  }
  await loadPlotAndReservations()
})

watch(
  () => route.params.id,
  async () => {
    await loadPlotAndReservations()
  }
)

function goBack() {
  router.push({ path: '/', query: route.query, hash: '#recherche' })
}

function navigateToHospital(code) {
  if (!code) return
  router.push({
    path: '/',
    query: { hospital: code },
    hash: '#recherche',
  })
}

function navigateToSector(sector) {
  if (!sector) return
  router.push({
    path: '/',
    query: { sector: sector },
    hash: '#recherche',
  })
}

function openPlotReserver() {
  const id = route.params.id
  const query = { ...route.query }
  if (isRangeSelected.value) {
    query.start = formatDate(selectedRange.value[0])
    query.end = formatDate(selectedRange.value[1])
  }
  router.push({ path: `/reservation/${id}`, query })
}
</script>

<style scoped>
:deep(.detail-datepicker-wrapper) {
  --dp-primary-color: #0d9488;
  --dp-primary-text-color: #ffffff;
  --dp-border-radius: 0.75rem;
  --dp-font-size: 0.8rem;
}

:deep(.dp__input) {
  background-color: #f8fafc;
  border-color: #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.8rem;
  padding: 0.6rem 0.75rem 0.6rem 2.25rem;
  color: #1e293b;
  font-weight: 500;
  font-family: inherit;
  box-shadow: none;
}

:deep(.dp__input:hover) {
  border-color: #cbd5e1;
}

:deep(.dp__input:focus) {
  border-color: #0d9488;
  outline: none;
}

:deep(.dp__icon) {
  color: #0d9488;
}
</style>
