import { computed, toValue } from 'vue'
import {
  calculerSuperficieAjustee,
  calculerPoidsRelatif,
  calculerValeurToponymique,
} from '../utils/calculEmplacement'

const formatSuperficie = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 2 })
const formatPourcent = new Intl.NumberFormat('fr-CA', { style: 'percent', maximumFractionDigits: 2 })
export const formatMontant = new Intl.NumberFormat('fr-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

const afficher = (valeur, format) => (valeur === null ? null : format(valeur))

function facteur(liste, id, cle) {
  return liste.find((item) => String(item.id) === String(id))?.[cle]
}

export function useCalculsEmplacement(formulaire, facteurs, superficieAjusteeActuelle = 0) {
  const superficieAjustee = computed(() =>
    calculerSuperficieAjustee(
      formulaire.superficie,
      facteur(toValue(facteurs).fl, formulaire.fl_id, 'fl'),
      facteur(toValue(facteurs).ff, formulaire.ff_id, 'ff'),
    ),
  )

  const poidsRelatif = computed(() =>
    calculerPoidsRelatif(
      superficieAjustee.value,
      toValue(facteurs).totalSuperficieAjustee - (Number(toValue(superficieAjusteeActuelle)) || 0),
    ),
  )

  const valeurToponymique = computed(() =>
    calculerValeurToponymique(poidsRelatif.value, formulaire.valorisation_totale),
  )

  const affichage = computed(() => ({
    superficie_ajuste: afficher(superficieAjustee.value, (v) => `${formatSuperficie.format(v)} m²`),
    poid_relatif: afficher(poidsRelatif.value, formatPourcent.format),
    valeur_toponymique: afficher(valeurToponymique.value, formatMontant.format),
  }))

  return { superficieAjustee, poidsRelatif, valeurToponymique, affichage }
}

export function libelleFacteur(type, facteur) {
  const detail =
    type === 'fl' ? facteur.type_lieu : `${formatSuperficie.format(facteur.nbr_personnes)} personnes`
  return `${formatSuperficie.format(facteur[type])} — ${detail}`
}

export const FORMULES = {
  superficie_ajuste: 'FL × FF × superficie',
  poid_relatif: 'Superficie ajustée ÷ total des superficies ajustées',
  valeur_toponymique: 'Poids relatif × valorisation totale',
}
