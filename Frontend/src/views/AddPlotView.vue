<script setup>
import { onMounted, onUnmounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useEmplacementsStore } from '../stores/emplacements'
import { useToastStore } from '../stores/toast'

const sections = [
  {
    titre: 'Localisation',
    champs: [
      { cle: 'composante_id', libelle: 'Hôpital', type: 'hopital', requis: true },
      { cle: 'no_local_pavillon', libelle: 'Numéro de local ou de pavillon' },
      { cle: 'lieu_specifique', libelle: 'Lieu spécifique', requis: true },
      { cle: 'type_lieu', libelle: 'Type de lieu' },
      { cle: 'categorie', libelle: 'Catégorie' },
      { cle: 'statut', libelle: 'Statut' },
      { cle: 'description', libelle: 'Description', type: 'textarea' },
    ],
  },
  {
    titre: 'Superficie et évaluation',
    champs: [
      { cle: 'superficie', libelle: 'Superficie', type: 'number' },
      { cle: 'superficie_ajuste', libelle: 'Superficie ajustée', type: 'number' },
      { cle: 'fl_id', libelle: 'Identifiant FL', type: 'number', entier: true, requis: true },
      { cle: 'ff_id', libelle: 'Identifiant FF', type: 'number', entier: true, requis: true },
      { cle: 'poid_relatif', libelle: 'Poids relatif', type: 'number' },
      { cle: 'valeur_toponymique', libelle: 'Valeur toponymique', type: 'number' },
      { cle: 'valeur_toponymique_ancien', libelle: 'Ancienne valeur toponymique', type: 'number' },
      { cle: 'commentaire', libelle: 'Commentaire', type: 'textarea' },
    ],
  },
]

const champs = sections.flatMap(section => section.champs)
const emptyValues = () => Object.fromEntries(champs.map(({ cle }) => [cle, '']))

const router = useRouter()
const toast = useToastStore()
const store = useEmplacementsStore()
const { hopitaux, envoiEnCours, erreur } = storeToRefs(store)
const formulaire = reactive(emptyValues())

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push('/admin')
}

async function submit() {
  const donnees = Object.fromEntries(
    Object.entries(formulaire).map(([cle, valeur]) => [cle, valeur === '' ? null : valeur]),
  )

  const reussi = await store.addPlot(donnees)
  if (!reussi) return

  toast.show(store.succes)
  goBack()
}

onMounted(store.fetchHospitals)

onUnmounted(store.clearMessages)
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-8 text-slate-900">
    <RouterLink to="/admin" class="text-sm text-teal-800 underline">Retour à l’administration</RouterLink>
    <h1 class="mt-4 text-3xl font-bold">Ajouter un emplacement</h1>
    <p class="mt-2 text-sm text-slate-600">Les champs marqués d’un astérisque (*) sont obligatoires.</p>

    <form class="mt-6 space-y-6" @submit.prevent="submit">
      <fieldset
        v-for="section in sections"
        :key="section.titre"
        :disabled="envoiEnCours"
        class="rounded-xl border border-slate-200 bg-white px-5 pb-5"
      >
        <legend class="px-2 text-lg font-semibold">{{ section.titre }}</legend>

        <div class="mt-3 grid gap-4 sm:grid-cols-2">
          <div
            v-for="champ in section.champs"
            :key="champ.cle"
            :class="{ 'sm:col-span-2': champ.type === 'textarea' }"
          >
            <label :for="champ.cle" class="mb-1 block text-sm font-medium">
              {{ champ.libelle }}<span v-if="champ.requis"> *</span>
            </label>

            <select
              v-if="champ.type === 'hopital'"
              :id="champ.cle"
              v-model="formulaire[champ.cle]"
              :required="champ.requis"
            >
              <option value="" disabled>Choisir un hôpital</option>
              <option v-for="hopital in hopitaux" :key="hopital.id" :value="hopital.id">
                {{ hopital.nom }}
              </option>
            </select>
            <textarea
              v-else-if="champ.type === 'textarea'"
              :id="champ.cle"
              v-model.trim="formulaire[champ.cle]"
              rows="3"
            />
            <input
              v-else
              :id="champ.cle"
              v-model.trim="formulaire[champ.cle]"
              :type="champ.type || 'text'"
              :min="champ.entier ? 1 : undefined"
              :step="champ.entier ? 1 : 'any'"
              :required="champ.requis"
            >
          </div>
        </div>
      </fieldset>

      <p v-if="erreur" role="alert" class="text-red-700">{{ erreur }}</p>

      <button
        type="submit"
        :disabled="envoiEnCours"
        class="rounded-lg bg-teal-800 px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        {{ envoiEnCours ? 'Ajout en cours…' : 'Ajouter l’emplacement' }}
      </button>
    </form>
  </main>
</template>

<style scoped>
input,
select,
textarea {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #94a3b8;
  border-radius: 0.4rem;
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #0f766e;
  outline-offset: 2px;
}
</style>