import { ref } from 'vue'
import { defineStore } from 'pinia'

const apiConfiguree = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE
const apiParDefaut = import.meta.env.DEV ? 'http://localhost:3000' : '/api'
const API_URL = (apiConfiguree || apiParDefaut).replace(/\/+$/, '')

function lireToken() {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Reconnecte-toi pour ajouter un emplacement.')
  return token
}

function messageErreur(cause) {
  return cause instanceof TypeError
    ? 'Serveur injoignable. Vérifie ta connexion.'
    : cause.message
}

export const useEmplacementsStore = defineStore('emplacements', () => {
  const hopitaux = ref([]) 
  const envoiEnCours = ref(false)
  const erreur = ref('')
  const succes = ref('')
  const nouvelId = ref(null)

  function effacerMessages() {
    erreur.value = ''
    succes.value = ''
    nouvelId.value = null
  }

  async function chargerHopitaux() {
    try {
      const reponse = await fetch(`${API_URL}/hopitaux`, {
        headers: { Authorization: `Bearer ${lireToken()}` },
      })
      const resultat = await reponse.json().catch(() => null)

      if (!reponse.ok) {
        throw new Error(resultat?.message || resultat?.erreur || `Impossible de charger les hôpitaux (HTTP ${reponse.status}).`)
      }
      // getAllHospitals renvoie directement un tableau
      if (!Array.isArray(resultat)) {
        throw new Error('Réponse inattendue du serveur pour la liste des hôpitaux.')
      }

      // À ADAPTER si tes colonnes ne s'appellent pas « id » et « nom »
      hopitaux.value = resultat.map(hopital => ({ id: hopital.id, nom: hopital.nom }))
    } catch (cause) {
      erreur.value = messageErreur(cause)
    }
  }

  async function ajouter(donnees) {
    if (envoiEnCours.value) return false

    effacerMessages()
    envoiEnCours.value = true

    try {
      const reponse = await fetch(`${API_URL}/emplacements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${lireToken()}`,
        },
        body: JSON.stringify(donnees),
      })
      const resultat = await reponse.json().catch(() => null)

      if (!reponse.ok) {
        throw new Error(resultat?.message || resultat?.erreur || `Échec de l’ajout (HTTP ${reponse.status}).`)
      }
      if (reponse.status !== 201) {
        throw new Error('Création non confirmée. Vérifie la liste des emplacements.')
      }

      nouvelId.value = resultat?.data?.emplacement?.id
      succes.value = 'Emplacement ajouté — ' + donnees.lieu_specifique
      return true
    } catch (cause) {
      erreur.value = messageErreur(cause)
      return false
    } finally {
      envoiEnCours.value = false
    }
  }

  return { hopitaux, envoiEnCours, erreur, succes, nouvelId, effacerMessages, chargerHopitaux, ajouter }
})