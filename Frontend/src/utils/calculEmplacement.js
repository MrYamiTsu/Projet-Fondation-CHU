const enNombre = (valeur) =>
  valeur === '' || valeur == null || !Number.isFinite(Number(valeur)) ? null : Number(valeur)

export function calculerSuperficieAjustee(superficie, fl, ff) {
  const valeurs = [superficie, fl, ff].map(enNombre)
  return valeurs.includes(null) ? null : valeurs.reduce((produit, valeur) => produit * valeur)
}

export function calculerPoidsRelatif(superficieAjustee, totalAutresEmplacements) {
  const ajustee = enNombre(superficieAjustee)
  if (ajustee === null) return null

  const total = (enNombre(totalAutresEmplacements) ?? 0) + ajustee
  return total > 0 ? ajustee / total : null
}

export function calculerValeurToponymique(poidsRelatif, valorisationTotale) {
  const poids = enNombre(poidsRelatif)
  const valorisation = enNombre(valorisationTotale)
  return poids === null || valorisation === null ? null : Math.round(poids * valorisation)
}
