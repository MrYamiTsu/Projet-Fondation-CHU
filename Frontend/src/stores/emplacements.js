import { ref } from 'vue'
import { defineStore } from 'pinia'

const configuredApi = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE
const defaultApi = import.meta.env.DEV ? 'http://localhost:3000' : '/api'
const API_URL = (configuredApi || defaultApi).replace(/\/+$/, '')

function getToken() {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Reconnecte-toi pour ajouter un emplacement.')
  return token
}

function getErrorMessage(cause) {
  return cause instanceof TypeError
    ? 'Serveur injoignable. Vérifie ta connexion.'
    : cause.message
}

export const useEmplacementsStore = defineStore('emplacements', () => {
  const hopitaux = ref([])
  const facteurs = ref({ fl: [], ff: [], totalSuperficieAjustee: 0 })
  const envoiEnCours = ref(false)
  const erreur = ref('')
  const succes = ref('')
  const nouvelId = ref(null)

  function clearMessages() {
    erreur.value = ''
    succes.value = ''
    nouvelId.value = null
  }

  async function fetchHospitals() {
    try {
      const reponse = await fetch(`${API_URL}/hopitaux`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const resultat = await reponse.json().catch(() => null)

      if (!reponse.ok) {
        throw new Error(resultat?.message || resultat?.erreur || `Impossible de charger les hôpitaux (HTTP ${reponse.status}).`)
      }
      if (!Array.isArray(resultat)) {
        throw new Error('Réponse inattendue du serveur pour la liste des hôpitaux.')
      }

      hopitaux.value = resultat.map(hopital => ({ id: hopital.id, nom: hopital.nom }))
    } catch (cause) {
      erreur.value = getErrorMessage(cause)
    }
  }

  async function fetchFacteurs() {
    try {
      const reponse = await fetch(`${API_URL}/emplacements/facteurs`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const resultat = await reponse.json().catch(() => null)

      if (!reponse.ok) {
        throw new Error(resultat?.message || resultat?.erreur || `Impossible de charger les facteurs FL et FF (HTTP ${reponse.status}).`)
      }
      if (!Array.isArray(resultat?.fl) || !Array.isArray(resultat?.ff)) {
        throw new Error('Réponse inattendue du serveur pour les facteurs FL et FF.')
      }

      facteurs.value = {
        fl: resultat.fl,
        ff: resultat.ff,
        totalSuperficieAjustee: Number(resultat.totalSuperficieAjustee) || 0,
      }
    } catch (cause) {
      erreur.value = getErrorMessage(cause)
    }
  }

  async function addPlot(donnees) {
    if (envoiEnCours.value) return false

    clearMessages()
    envoiEnCours.value = true

    try {
      const reponse = await fetch(`${API_URL}/emplacements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
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
      erreur.value = getErrorMessage(cause)
      return false
    } finally {
      envoiEnCours.value = false
    }
  }

  return {
    hopitaux,
    facteurs,
    envoiEnCours,
    erreur,
    succes,
    nouvelId,
    clearMessages,
    fetchHospitals,
    fetchFacteurs,
    addPlot,
  }
})
