<script setup>
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useEmplacementsStore } from '../stores/emplacements'
import { useToastStore } from '../stores/toast'
import {
  calculerSuperficieAjustee,
  calculerPoidsRelatif,
  calculerValeurToponymique,
} from '../utils/calculEmplacement'

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
      { cle: 'superficie', libelle: 'Superficie (m²)', type: 'number' },
      { cle: 'fl_id', libelle: 'Facteur de localisation (FL)', type: 'fl', requis: true },
      { cle: 'ff_id', libelle: 'Facteur de fréquentation (FF)', type: 'ff', requis: true },
      { cle: 'superficie_ajuste', libelle: 'Superficie ajustée', type: 'calcule', formule: 'FL × FF × superficie' },
      { cle: 'poid_relatif', libelle: 'Poids relatif', type: 'calcule', formule: 'Superficie ajustée ÷ total des superficies ajustées' },
      { cle: 'valorisation_totale', libelle: 'Valorisation totale ($)', type: 'number', horsBd: true, aide: 'Sert uniquement au calcul, n’est pas enregistrée.' },
      { cle: 'valeur_toponymique', libelle: 'Valeur toponymique', type: 'calcule', formule: 'Poids relatif × valorisation totale' },
      { cle: 'valeur_toponymique_ancien', libelle: 'Ancienne valeur toponymique', type: 'number', facultatif: true },
      { cle: 'commentaire', libelle: 'Commentaire', type: 'textarea' },
    ],
  },
]

const champs = sections.flatMap(section => section.champs).filter(champ => champ.type !== 'calcule')
const champsHorsBd = new Set(champs.filter(champ => champ.horsBd).map(champ => champ.cle))
const emptyValues = () => Object.fromEntries(champs.map(({ cle }) => [cle, '']))

const router = useRouter()
const toast = useToastStore()
const store = useEmplacementsStore()
const { hopitaux, facteurs, envoiEnCours, erreur } = storeToRefs(store)
const formulaire = reactive(emptyValues())

const facteurChoisi = (liste, id, cle) => liste.find(item => String(item.id) === String(id))?.[cle]

const superficieAjustee = computed(() =>
  calculerSuperficieAjustee(
    formulaire.superficie,
    facteurChoisi(facteurs.value.fl, formulaire.fl_id, 'fl'),
    facteurChoisi(facteurs.value.ff, formulaire.ff_id, 'ff'),
  ),
)

const poidsRelatif = computed(() =>
  calculerPoidsRelatif(superficieAjustee.value, facteurs.value.totalSuperficieAjustee),
)

const valeurToponymique = computed(() =>
  calculerValeurToponymique(poidsRelatif.value, formulaire.valorisation_totale),
)

const formatNombre = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 2 })
const formatMonetaire = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 })
const formatPourcent = new Intl.NumberFormat('fr-CA', { style: 'percent', maximumFractionDigits: 2 })

const valeursCalculees = computed(() => ({
  superficie_ajuste: superficieAjustee.value === null ? null : `${formatNombre.format(superficieAjustee.value)} m²`,
  poid_relatif: poidsRelatif.value === null ? null : formatPourcent.format(poidsRelatif.value),
  valeur_toponymique: valeurToponymique.value === null ? null : formatMonetaire.format(valeurToponymique.value),
}))

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push('/admin')
}

async function submit() {
  const donnees = Object.fromEntries(
    Object.entries(formulaire)
      .filter(([cle]) => !champsHorsBd.has(cle))
      .map(([cle, valeur]) => [cle, valeur === '' ? null : valeur]),
  )
  donnees.valeur_toponymique = valeurToponymique.value

  const reussi = await store.addPlot(donnees)
  if (!reussi) return

  toast.show(store.succes)
  goBack()
}

onMounted(() => {
  store.fetchHospitals()
  store.fetchFacteurs()
})

onUnmounted(store.clearMessages)
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-8 text-slate-900">
    <RouterLink to="/admin" class="text-sm text-teal-800 underline">Retour à l’administration</RouterLink>
    <h1 class="mt-4 text-3xl font-bold">Ajouter un emplacement</h1>
    <p class="mt-2 text-sm text-slate-600">Les champs marqués d’un astérisque (*) sont obligatoires.</p>

    <form class="mt-6 space-y-6" @submit.prevent="submit">
      <div class="grid items-start gap-6 lg:grid-cols-2">
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
                <span v-if="champ.facultatif" class="font-normal text-slate-500"> (facultatif)</span>
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
              <select
                v-else-if="champ.type === 'fl' || champ.type === 'ff'"
                :id="champ.cle"
                v-model="formulaire[champ.cle]"
                :required="champ.requis"
              >
                <option value="" disabled>Choisir un facteur</option>
                <option v-for="facteur in facteurs[champ.type]" :key="facteur.id" :value="facteur.id">
                  {{ formatNombre.format(facteur[champ.type]) }} —
                  {{ champ.type === 'fl' ? facteur.type_lieu : `${formatNombre.format(facteur.nbr_personnes)} personnes` }}
                </option>
              </select>
              <div v-else-if="champ.type === 'calcule'">
                <output
                  :id="champ.cle"
                  for="superficie fl_id ff_id"
                  aria-live="polite"
                  class="calcule"
                  :class="{ 'calcule--vide': valeursCalculees[champ.cle] === null }"
                >
                  {{ valeursCalculees[champ.cle] ?? 'Calculé automatiquement' }}
                </output>
                <p class="mt-1 text-xs text-slate-500">{{ champ.formule }}</p>
              </div>
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
                :aria-describedby="champ.aide ? `${champ.cle}-aide` : undefined"
              >
              <p v-if="champ.aide" :id="`${champ.cle}-aide`" class="mt-1 text-xs text-slate-500">{{ champ.aide }}</p>
            </div>
          </div>
        </fieldset>
      </div>

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

.calcule {
  display: flex;
  align-items: center;
  min-height: 2.45rem;
  padding: 0.55rem 0.75rem;
  border: 1px dashed #cbd5e1;
  border-radius: 0.4rem;
  background: #f8fafc;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #0f172a;
  cursor: default;
  user-select: text;
}

.calcule--vide {
  font-weight: 400;
  font-style: italic;
  color: #94a3b8;
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #0f766e;
  outline-offset: 2px;
}
</style>