<template>
  <div>
    <Header :current-user="authStore.currentUser" @open-auth="isAuthModalOpen = true" @logout="authStore.logout">
      <template #auth>
        <Auth :is-open="isAuthModalOpen" :users="authStore.users" @close="isAuthModalOpen = false" />
      </template>
    </Header>
  </div>

  <main class="bg-white min-h-screen max-w-7xl mx-auto px-4 md:px-8 py-8">
    <div class="max-w-6xl mx-auto mb-6">
      <button @click="goBack"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs border border-slate-200/80 group">
        <i class="fa-solid fa-arrow-left text-xs group-hover:-translate-x-1 transition-transform"></i>
        <span>Retour aux détails</span>
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
      <aside class="lg:sticky lg:top-8">
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div class="aspect-4/3 bg-gray-50 flex items-center justify-center">
            <img v-if="plot?.image" :src="plot.image" :alt="plot.name || 'Image de l\'emplacement'"
              class="w-full h-full object-cover" />
            <div v-else class="flex flex-col items-center gap-2 text-gray-400">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m2.25 15.75 5.16-5.16a2.25 2.25 0 0 1 3.18 0l5.16 5.16m-1.5-1.5 1.41-1.41a2.25 2.25 0 0 1 3.18 0l2.91 2.91M3.75 20.25h16.5a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5Z" />
              </svg>
              <span class="text-sm">Aucune image disponible</span>
            </div>
          </div>
          <div v-if="plot" class="p-4">
            <p class="text-sm font-medium text-gray-900">
              {{ plot.name || `Emplacement #${plot.id}` }}
            </p>
          </div>
        </div>
      </aside>

      <form class="w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6"
        @submit.prevent="onSubmit">
        <div class="space-y-1">
          <h2 class="text-xl font-semibold text-gray-900">Aperçu d'un emplacement</h2>
          <p class="text-sm text-gray-500">Remplis les informations ci-dessous.</p>
        </div>

        <div>
          <label for="nom" class="block mb-2 text-sm font-medium text-gray-900">
            Nom ou phrase à afficher <span class="text-red-500">*</span>
          </label>
          <input type="text" name="nom" id="nom" v-model="form.nom" required placeholder="Ex. : Marie Tremblay"
            class="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg placeholder:text-gray-400 transition focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
        </div>

        <div>
          <label for="type" class="block mb-2 text-sm font-medium text-gray-900">
            Type de reconnaissance <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <select id="type" name="type" v-model="form.type" required
              class="block w-full appearance-none px-3.5 py-2.5 pr-10 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg transition focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 invalid:text-gray-400">
              <option value="" disabled selected hidden>-- Choisir --</option>
              <option value="NO" class="text-gray-900">Nomination</option>
              <option value="PC" class="text-gray-900">Partenaire corporatif</option>
            </select>
            <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none"
              stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div>
          <label for="file_input" class="block mb-2 text-sm font-medium text-gray-900">
            Téléverser une image
          </label>
          <input id="file_input" name="image" type="file" accept="image/png, image/jpeg, image/webp, image/gif"
            @change="onFileChange"
            class="block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer transition focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 file:mr-4 file:py-2.5 file:px-4 file:border-0 file:border-r file:border-gray-300 file:bg-gray-100 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer" />
          <p class="mt-1.5 text-xs text-gray-500">PNG, JPG, WEBP ou GIF (max. 5 Mo).</p>
          <p v-if="fileError" class="mt-1.5 text-xs text-red-600">{{ fileError }}</p>

          <img v-if="previewUrl" :src="previewUrl" alt="Aperçu de l'image"
            class="mt-3 max-h-40 rounded-lg border border-gray-200 object-contain" />
        </div>

        <div>
          <p class="text-lg text-gray-600">Prix de l'emplacement</p>
          <p class="text-xl font-bold text-slate-900 font-mono">
            {{ plot?.formattedPrice || 'Prix indisponible' }}
          </p>
        </div>


        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900">
            Période de réservation <span class="text-red-500">*</span>
          </label>

          <VueDatePicker v-model="selectedRange" :range="{ noDisabledRange: true, partialRange: false }"
            :disabled-dates="disabledDates" :min-date="new Date()" :enable-time-picker="false"
            :disabled="reservationStore.loading || Boolean(reservationStore.error)" placeholder="Choisir une période"
            auto-apply />

          <p v-if="nbJours" class="mt-2 text-xs text-gray-500">
            Durée : {{ nbJours }} jour{{ nbJours > 1 ? 's' : '' }}
          </p>
        </div>

        <button type="submit" :disabled="reservationStore.loading ||
          Boolean(reservationStore.error) ||
          !form.start ||
          !form.end
          "
          class="w-full text-white bg-[#0A1526] hover:bg-[#132238] disabled:opacity-50 font-medium rounded-lg text-sm px-5 py-2.5">
          {{ reservationStore.loading ? 'Enregistrement...' : 'Confirmer réservation' }}
        </button>

        <p v-if="reservationError" class="text-sm text-red-600">
          {{ reservationError }}
        </p>

        <p v-if="reservationSuccess" class="text-sm text-green-600">
          {{ reservationSuccess }}
        </p>
      </form>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Auth from '../components/Auth.vue'
import { useAuthStore } from '../stores/auth.js'
import { usePlotsStore } from '../stores/plots.js'
import { useReservationStore } from '../stores/reservations.js'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'


const authStore = useAuthStore()
const plotsStore = usePlotsStore()
const reservationStore = useReservationStore()
const isAuthModalOpen = ref(false)

const route = useRoute()
const router = useRouter()

const MAX_SIZE = 5 * 1024 * 1024 // 5 Mo
const form = reactive({ nom: '', type: '', image: null, start: '', end: '' })
const fileError = ref('')
const previewUrl = ref('')
const reservationError = ref('')
const reservationSuccess = ref('')
const selectedRange = ref(null)

function onFileChange(e) {
  const file = e.target.files[0]
  fileError.value = ''

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  form.image = null

  if (!file) return

  if (!file.type.startsWith('image/')) {
    fileError.value = 'Seules les images sont acceptées.'
    e.target.value = ''
    return
  }
  if (file.size > MAX_SIZE) {
    fileError.value = "L'image dépasse 5 Mo."
    e.target.value = ''
    return
  }

  form.image = file
  previewUrl.value = URL.createObjectURL(file)
}



const disabledDates = computed(() => {
  return (date) => {
    const currentDate = formatDate(date)

    return reservationStore.reservedPeriods.some((period) => {
      return currentDate >= period.start && currentDate <= period.end
    })
  }
})


function formatDate(date) {
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

watch(selectedRange, (range) => {
  form.start = range?.[0] ? formatDate(range[0]) : ''
  form.end = range?.[1] ? formatDate(range[1]) : ''
})

async function onSubmit() {
  reservationError.value = ''
  reservationSuccess.value = ''

  if (!plot.value) {
    reservationError.value = 'Emplacement introuvable'
    return
  }

  if (!authStore.currentUser) {
    isAuthModalOpen.value = true
    return
  }

  if (!form.start || !form.end || form.end < form.start) {
    reservationError.value = 'Veuillez sélectionner une période valide'
    return
  }

  try {
    const reservation = await reservationStore.addReservation(plot.value.id, form.start, form.end)

    reservationSuccess.value = 'Réservation créée avec succès'
    console.log('Réservation créée :', reservation)
    await reservationStore.getReservedPeriods(plot.value.id)
    selectedRange.value = null
  } catch (erreur) {
    reservationError.value = erreur.message
    console.error('Erreur de réservation :', erreur)
  }
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

const plot = computed(() => {
  const id = Number(route.params.id)
  if (!id) return null
  if (plotsStore.plot && Number(plotsStore.plot.id) === id) {
    return plotsStore.plot
  }
  return plotsStore.plots.find((p) => Number(p.id) === id) || plotsStore.plot || null
})

async function loadPlot() {
  const id = Number(route.params.id)
  if (!isNaN(id) && id > 0) {
    await plotsStore.getPlotById(id)
  }
}

onMounted(async () => {
  await loadPlot()
})

watch(
  () => route.params.id,
  async () => {
    await loadPlot()
  },
)

watch(
  () => form.start,
  (start) => {
    if (form.end && start && form.end < start) form.end = ''
  },
)



watch(
  () => plot.value?.id,
  async (emplacementId) => {
    selectedRange.value = null

    if (!emplacementId) return

    try {
      await reservationStore.getReservedPeriods(emplacementId)
    } catch (err) {
      reservationError.value = err.message
      console.error('Erreur des réservations :', err)
    }
  },
  { immediate: true }
)

const nbJours = computed(() => {
  if (!form.start || !form.end) return 0
  const diff = new Date(form.end) - new Date(form.start)
  return Math.round(diff / 86_400_000) + 1
})

function goBack() {
  const id = route.params.id
  router.push({ path: `/emplacement/${id}`, query: route.query })
}
</script>
