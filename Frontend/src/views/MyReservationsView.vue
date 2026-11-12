<template>
  <Header
    :current-user="authStore.currentUser"
    @open-auth="isAuthModalOpen = true"
    @logout="authStore.logout"
  >
    <template #auth>
      <Auth :is-open="isAuthModalOpen" :users="authStore.users" @close="isAuthModalOpen = false" />
    </template>
  </Header>

  <main class="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
    <div class="mx-auto max-w-6xl">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900">Mes réservations</h1>
        <p class="mt-2 text-sm text-gray-500">Consultez vos demandes de réservation et leur statut.</p>
      </header>

      <div
        v-if="successMessage"
        role="status"
        class="mb-6 flex items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
      >
        <span>{{ successMessage }}</span>
        <button
          type="button"
          aria-label="Fermer le message"
          @click="successMessage = ''"
          class="text-xl leading-none hover:text-green-900"
        >
          ×
        </button>
      </div>

      <template v-if="!visibleReservations.length">
        <p v-if="reservationStore.loading" role="status" class="py-12 text-center text-gray-500">
          Chargement des réservations...
        </p>
        <p
          v-else-if="reservationStore.error"
          role="alert"
          class="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
        >
          {{ reservationStore.error }}
        </p>
        <p v-else class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500">
          Aucune réservation à afficher.
        </p>
      </template>

      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <article
          v-for="reservation in visibleReservations"
          :key="reservation.id"
          class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div class="mb-5 flex items-start justify-between gap-4">
            <div>
              <p class="mb-1 text-xs text-gray-400">Réservation #{{ reservation.id }}</p>
              <h2 class="text-lg font-semibold text-slate-900">
                {{ reservation.lieu_specifique || `Emplacement #${reservation.emplacement_id}` }}
              </h2>
              <p class="mt-1 text-sm text-gray-500">{{ reservation.no_local_pavillon }}</p>
            </div>
            <span
              class="whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold"
              :class="statuses[reservation.statut]?.color"
            >
              {{ statuses[reservation.statut]?.label ?? reservation.statut }}
            </span>
          </div>

          <dl class="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
              <dt class="mb-1 text-xs text-gray-500">Date de début</dt>
              <dd class="text-sm font-medium text-gray-900">{{ formatDate(reservation.date_debut) }}</dd>
            </div>
            <div>
              <dt class="mb-1 text-xs text-gray-500">Date de fin</dt>
              <dd class="text-sm font-medium text-gray-900">{{ formatDate(reservation.date_fin) }}</dd>
            </div>
          </dl>

          <div class="mt-5 border-t border-gray-100 pt-4">
            <fieldset v-if="editor?.id === reservation.id" class="min-w-0">
              <legend class="mb-2 text-sm font-medium text-gray-700">Nouvelle période de réservation</legend>
              <VueDatePicker
                v-model="editor.range"
                :range="rangeOptions"
                :disabled-dates="isDateDisabled"
                :min-date="new Date()"
                :enable-time-picker="false"
                :disabled="isLoadingPeriods"
                :locale="fr"
                placeholder="Sélectionnez une période disponible"
              />
              <p v-if="editor.error" role="alert" class="mt-2 text-sm text-red-600">{{ editor.error }}</p>
              <p v-else-if="isLoadingPeriods" role="status" class="mt-2 text-sm text-gray-500">
                Chargement des dates disponibles...
              </p>
              <div class="mt-4 flex gap-3">
                <button
                  type="button"
                  :disabled="isLoadingPeriods"
                  @click="askUpdateConfirmation(reservation)"
                  class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  @click="editor = null"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                >
                  Fermer
                </button>
              </div>
            </fieldset>

            <div v-else class="flex flex-wrap items-center justify-between gap-3">
              <RouterLink
                :to="`/emplacement/${reservation.emplacement_id}`"
                class="text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Voir l'emplacement
              </RouterLink>
              <div v-if="reservation.statut === 'pending'" class="flex gap-2">
                <button
                  type="button"
                  :disabled="editor !== null"
                  @click="openEditor(reservation)"
                  class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  @click="askCancelConfirmation(reservation)"
                  class="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                >
                  <span aria-hidden="true">×</span>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <div
      v-if="confirmation"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="closeConfirmation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div class="mb-4 flex items-center gap-3">
          <span aria-hidden="true" class="rounded-full p-3 text-xl" :class="dialog.iconColor">{{ dialog.icon }}</span>
          <h2 id="confirmation-title" class="text-xl font-semibold text-gray-900">{{ dialog.title }}</h2>
        </div>

        <p class="mb-3 text-sm text-gray-600">
          {{ dialog.question }} <strong>#{{ confirmation.id }}</strong> ?
        </p>

        <p v-if="confirmation.type === 'cancel'" class="mb-6 text-sm text-gray-500">
          Cette action retirera votre demande de réservation.
        </p>
        <dl v-else class="mb-5 space-y-3 rounded-xl bg-gray-50 p-4">
          <div>
            <dt class="text-xs text-gray-500">Nouvelle date de début</dt>
            <dd class="font-medium text-gray-900">{{ formatDate(confirmation.dateDebut) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500">Nouvelle date de fin</dt>
            <dd class="font-medium text-gray-900">{{ formatDate(confirmation.dateFin) }}</dd>
          </div>
        </dl>

        <p v-if="confirmation.error" role="alert" class="mb-4 text-sm text-red-600">{{ confirmation.error }}</p>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            :disabled="isSubmitting"
            @click="closeConfirmation"
            class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {{ dialog.back }}
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            @click="confirmAction"
            class="rounded-lg px-4 py-2 text-white disabled:opacity-50"
            :class="dialog.buttonColor"
          >
            {{ isSubmitting ? dialog.busy : dialog.confirm }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { format, isValid, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import Header from '../components/Header.vue'
import Auth from '../components/Auth.vue'
import { useAuthStore } from '../stores/auth.js'
import { useReservationStore } from '../stores/reservations.js'

const authStore = useAuthStore()
const reservationStore = useReservationStore()

const isAuthModalOpen = ref(false)
const isSubmitting = ref(false)
const successMessage = ref('')

const editor = ref(null)


const confirmation = ref(null)

const isLoadingPeriods = computed(() => editor.value?.periods === null)

// Les réservations annulées ne sont pas affichées
const visibleReservations = computed(() =>
  reservationStore.myReservations.filter(reservation => reservation.statut !== 'cancelled'),
)


const statuses = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmée', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700' },
}

const dialogs = {
  cancel: {
    title: 'Annuler la réservation ?',
    question: 'Êtes-vous sûr de vouloir annuler la réservation',
    back: 'Conserver',
    confirm: 'Oui, annuler',
    busy: 'Annulation...',
    icon: '!',
    iconColor: 'bg-red-100 text-red-600',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    success: 'Votre réservation a bien été annulée.',
  },
  update: {
    title: 'Confirmer la modification',
    question: 'Voulez-vous enregistrer les nouvelles dates de la réservation',
    back: 'Retour',
    confirm: 'Confirmer',
    busy: 'Modification...',
    icon: '✓',
    iconColor: 'bg-blue-50 text-blue-700',
    buttonColor: 'bg-blue-700 hover:bg-blue-800',
    success: 'Les dates de votre réservation ont bien été modifiées.',
  },
}

const dialog = computed(() => dialogs[confirmation.value.type])


const rangeOptions = { noDisabledRange: true, partialRange: false }

function toApiDate(value) {
  if (!value) return ''
  return value instanceof Date ? format(value, 'yyyy-MM-dd') : String(value).slice(0, 10)
}

function toDate(value) {
  return parseISO(toApiDate(value))
}

function formatDate(value) {
  const date = toDate(value)
  return isValid(date) ? format(date, 'PPP', { locale: fr }) : 'Date indisponible'
}

function overlapsReservedPeriod(periods, start, end = start) {
  return periods.some(period => start <= period.end && end >= period.start)
}

function isDateDisabled(date) {
  return overlapsReservedPeriod(editor.value?.periods ?? [], toApiDate(date))
}


async function openEditor(reservation) {
  editor.value = {
    id: reservation.id,
    range: [toDate(reservation.date_debut), toDate(reservation.date_fin)],
    periods: null,
    error: '',
  }
  const form = editor.value

  try {
    await reservationStore.getReservedPeriods(reservation.emplacement_id, reservation.id)
    if (editor.value !== form) return

    form.periods = reservationStore.reservedPeriods.map(period => ({
      start: toApiDate(period.start),
      end: toApiDate(period.end),
    }))
  } catch (error) {
    form.error = error?.message || 'Impossible de charger les dates disponibles.'
  }
}

function askUpdateConfirmation(reservation) {
  const form = editor.value
  form.error = ''

  const [start, end] = form.range ?? []
  const dateDebut = toApiDate(start)
  const dateFin = toApiDate(end)

  if (!dateDebut || !dateFin) {
    form.error = 'Veuillez sélectionner une période complète.'
    return
  }

  if (dateDebut === toApiDate(reservation.date_debut) && dateFin === toApiDate(reservation.date_fin)) {
    editor.value = null
    return
  }

  if (overlapsReservedPeriod(form.periods, dateDebut, dateFin)) {
    form.error = 'Cette période contient des dates indisponibles.'
    return
  }

  confirmation.value = { type: 'update', id: reservation.id, dateDebut, dateFin, error: '' }
  editor.value = null
}


function askCancelConfirmation(reservation) {
  confirmation.value = { type: 'cancel', id: reservation.id, error: '' }
}


function closeConfirmation() {
  if (!isSubmitting.value) confirmation.value = null
}

async function confirmAction() {
  const action = confirmation.value
  action.error = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    if (action.type === 'cancel') {
      await reservationStore.cancelMyReservation(action.id)
    } else {
      await reservationStore.updateMyReservation(action.id, action.dateDebut, action.dateFin)
    }
    successMessage.value = dialog.value.success
    confirmation.value = null
  } catch (error) {
    action.error = error?.message || "Impossible d'enregistrer cette action."
  } finally {
    isSubmitting.value = false
  }
}


onMounted(async () => {
  try {
    await reservationStore.fetchMyReservations()
  } catch (error) {
    console.error('Erreur de chargement des réservations', error)
  }
})
</script>
