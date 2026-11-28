function nombre(valeur) {
  if (valeur === '' || valeur == null) return null
  const n = Number(valeur)
  return Number.isFinite(n) ? n : null
}

export function calculerSuperficieAjustee(superficie, fl, ff) {
  const [s, f, g] = [nombre(superficie), nombre(fl), nombre(ff)]
  if (s === null || f === null || g === null) return null
  return f * g * s
}

export function calculerPoidsRelatif(superficieAjustee, totalAutresEmplacements) {
  const ajustee = nombre(superficieAjustee)
  if (ajustee === null) return null
  const total = (nombre(totalAutresEmplacements) ?? 0) + ajustee
  return total > 0 ? ajustee / total : null
}

export function calculerValeurToponymique(poidsRelatif, valorisationTotale) {
  const [poids, valorisation] = [nombre(poidsRelatif), nombre(valorisationTotale)]
  if (poids === null || valorisation === null) return null
  return Math.round(poids * valorisation)
}
