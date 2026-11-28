<template>
  
  <main class="reservations-page">
    <div class="page-content">
      <RouterLink :to="{ name: 'admin' }" class="back-link">Retour à l’administration</RouterLink>

      <header class="page-header">
        <div>
          <h1>Réservations</h1>
          <p class="description">Confirmez ou annulez les demandes de tous les utilisateurs.</p>
        </div>
        <button type="button" class="btn" :disabled="busy" @click="charger">
          {{ allLoading ? 'Chargement…' : 'Actualiser' }}
        </button>
      </header>

      <p v-if="successMessage" class="notice notice--success" role="status">
        {{ successMessage }}
      </p>
      <div v-if="allError" class="notice notice--error" role="alert">
        <p>{{ allError }}</p>
        <button type="button" class="btn" :disabled="busy" @click="charger">
          Recharger la liste
        </button>
      </div>

      <div class="filters" role="group" aria-label="Filtrer par statut">
        <button
          v-for="option in FILTRES"
          :key="option.value"
          type="button"
          class="filter"
          :class="{ 'filter--active': filtreActif === option.value }"
          :aria-pressed="filtreActif === option.value"
          @click="choisirFiltre(option.value)"
        >
          {{ option.label }}
          <span class="filter-count">{{ compter(option.value) }}</span>
        </button>
      </div>

      <section aria-label="Liste des réservations" :aria-busy="allLoading">
        <p v-if="allLoading" class="state" role="status">Chargement des réservations…</p>

        <div v-else-if="reservationsVisibles.length" class="table-wrapper">
          <table>
            <caption class="sr-only">Liste des réservations</caption>
            <thead>
              <tr>
                <th scope="col">Réservation</th>
                <th scope="col">Utilisateur</th>
                <th scope="col">Emplacement</th>
                <th scope="col">Début</th>
                <th scope="col">Fin</th>
                <th scope="col">Statut</th>
                <th scope="col" class="cell-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="reservation in reservationsVisibles"
                :key="reservation.id"
                :class="{ 'row--validation': enValidation(reservation) }"
              >
                <th scope="row" data-label="Réservation">N° {{ reservation.id }}</th>
                <td data-label="Utilisateur">{{ nomUtilisateur(reservation) }}</td>
                <td data-label="Emplacement">
                  <RouterLink
                    v-if="reservation.emplacement_id != null"
                    :to="{ name: 'emplacement-detail', params: { id: reservation.emplacement_id } }"
                    :aria-label="`Voir l’emplacement ${reservation.emplacement_id}`"
                  >
                    N° {{ reservation.emplacement_id }}
                  </RouterLink>
                  <span v-else>—</span>
                </td>
                <td data-label="Début">{{ afficherDate(reservation.date_debut) }}</td>
                <td data-label="Fin">{{ afficherDate(reservation.date_fin) }}</td>
                <td data-label="Statut">
                  <span class="status" :class="`status--${reservation.statut}`">
                    {{ libelleStatut(reservation.statut) }}
                  </span>
                </td>
                <td class="cell-actions" data-label="Actions">
                  <div v-if="idAConfirmer === reservation.id" class="validation">
                    <span class="validation-question">Confirmer cette réservation ?</span>
                    <button type="button" class="btn" :disabled="busy" @click="fermerValidation">
                      Retour
                    </button>
                    <button
                      type="button"
                      class="btn btn--confirm btn--solid"
                      :disabled="busy"
                      @click="confirmer(reservation.id)"
                    >
                      {{
                        processingReservationId === reservation.id
                          ? 'Confirmation…'
                          : 'Oui, confirmer'
                      }}
                    </button>
                  </div>

                  <div v-else-if="idAAnnuler === reservation.id" class="validation">
                    <span class="validation-question">Annuler cette réservation ?</span>
                    <button type="button" class="btn" :disabled="busy" @click="fermerValidation">
                      Retour
                    </button>
                    <button
                      type="button"
                      class="btn btn--cancel btn--solid"
                      :disabled="busy"
                      @click="annuler(reservation.id)"
                    >
                      {{ processingReservationId === reservation.id ? 'Annulation…' : 'Oui, annuler' }}
                    </button>
                  </div>

                  <div v-else-if="peutConfirmer(reservation) || peutAnnuler(reservation)" class="actions">
                    <button
                      v-if="peutConfirmer(reservation)"
                      type="button"
                      class="btn btn--confirm"
                      :disabled="busy"
                      :aria-label="`Confirmer la réservation n° ${reservation.id}`"
                      @click="demanderConfirmation(reservation.id)"
                    >
                      Confirmer
                    </button>
                    <button
                      v-if="peutAnnuler(reservation)"
                      type="button"
                      class="btn btn--cancel"
                      :disabled="busy"
                      :aria-label="`Annuler la réservation n° ${reservation.id}`"
                      @click="demanderAnnulation(reservation.id)"
                    >
                      Annuler
                    </button>
                  </div>

                  <span v-else class="muted">Aucune action</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="!allError" class="state" role="status">
          <p class="state-title">{{ messageVide }}</p>
          <button
            v-if="filtreActif !== 'all'"
            type="button"
            class="link-button"
            @click="choisirFiltre('all')"
          >
            Afficher toutes les réservations
          </button>
        </div>

        <p v-else class="state">La liste n’a pas pu être chargée.</p>
      </section>
    </div>
  </main>
</template>

<style scoped src="../assets/AdminReservationsView.css"></style>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useReservationStore } from '../stores/reservations.js'

const reservationStore = useReservationStore()
const { allReservations, allLoading, allError, processingReservationId } =
  storeToRefs(reservationStore)

const route = useRoute()
const router = useRouter()

const FILTRES = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'cancelled', label: 'Annulées' },
]

const LIBELLES_STATUT = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
}

const successMessage = ref('')
const idAConfirmer = ref(null)
const idAAnnuler = ref(null) 

const busy = computed(() => allLoading.value || processingReservationId.value !== null)

const filtreActif = computed(() => {
  const statut = route.query.statut
  const estValide = FILTRES.some((filtre) => filtre.value === statut)
  return estValide ? statut : 'all'
})

const reservationsVisibles = computed(() => {
  let liste = allReservations.value

  if (filtreActif.value !== 'all') {
    liste = liste.filter((reservation) => reservation.statut === filtreActif.value)
  }

  return [...liste].sort((a, b) => b.id - a.id)
})

const messageVide = computed(() => {
  if (filtreActif.value === 'pending') return 'Aucune réservation en attente'
  if (filtreActif.value === 'confirmed') return 'Aucune réservation confirmée'
  if (filtreActif.value === 'cancelled') return 'Aucune réservation annulée'
  return 'Aucune réservation pour le moment'
})

function compter(valeur) {
  if (valeur === 'all') return allReservations.value.length
  return allReservations.value.filter((reservation) => reservation.statut === valeur).length
}

function libelleStatut(statut) {
  return LIBELLES_STATUT[statut] || statut || '—'
}

function afficherDate(valeur) {
  if (!valeur) return '—'
  const [annee, mois, jour] = String(valeur).slice(0, 10).split('-')
  return `${jour}/${mois}/${annee}`
}

function nomUtilisateur(reservation) {
  if (reservation.prenom || reservation.nom) {
    return `${reservation.prenom ?? ''} ${reservation.nom ?? ''}`.trim()
  }
  if (reservation.email) return reservation.email
  return `N° ${reservation.utilisateur_id}`
}

function peutConfirmer(reservation) {
  return reservation.statut === 'pending'
}

function peutAnnuler(reservation) {
  return reservation.statut === 'pending' || reservation.statut === 'confirmed'
}

function enValidation(reservation) {
  return idAConfirmer.value === reservation.id || idAAnnuler.value === reservation.id
}

function demanderConfirmation(id) {
  successMessage.value = ''
  idAAnnuler.value = null
  idAConfirmer.value = id
}

function demanderAnnulation(id) {
  successMessage.value = ''
  idAConfirmer.value = null
  idAAnnuler.value = id
}

function fermerValidation() {
  idAConfirmer.value = null
  idAAnnuler.value = null
}

function choisirFiltre(valeur) {
  fermerValidation()
  successMessage.value = ''

  if (valeur === 'all') {
    router.replace({ query: {} })
  } else {
    router.replace({ query: { statut: valeur } })
  }
}

async function charger() {
  fermerValidation()
  successMessage.value = ''

  try {
    await reservationStore.fetchAllReservations()
  } catch {
  }
}

async function confirmer(id) {
  try {
    await reservationStore.confirmReservationAsAdmin(id)
    successMessage.value = `La réservation n° ${id} a été confirmée.`
  } catch {
  }

  fermerValidation()
}

async function annuler(id) {
  try {
    await reservationStore.cancelReservationAsAdmin(id)
    successMessage.value = `La réservation n° ${id} a été annulée.`
  } catch {
  }

  fermerValidation()
}

onMounted(charger)
</script>
