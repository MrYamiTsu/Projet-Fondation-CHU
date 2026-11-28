import { describe, it, expect } from 'vitest'
import { reactive } from 'vue'
import { useCalculsEmplacement } from '../src/composables/useCalculsEmplacement.js'
import {
  calculerSuperficieAjustee,
  calculerPoidsRelatif,
  calculerValeurToponymique,
} from '../src/utils/calculEmplacement.js'

describe('calculerSuperficieAjustee', () => {
  it('multiplie FL × FF × superficie', () => {
    expect(calculerSuperficieAjustee(250, 1.75, 2)).toBe(875)
    expect(calculerSuperficieAjustee('25', '1.25', '0.75')).toBeCloseTo(23.4375)
  })

  it('reste vide si une valeur manque ou est invalide', () => {
    expect(calculerSuperficieAjustee('', 1, 1)).toBeNull()
    expect(calculerSuperficieAjustee(100, undefined, 1)).toBeNull()
    expect(calculerSuperficieAjustee(100, 1, null)).toBeNull()
    expect(calculerSuperficieAjustee('abc', 1, 1)).toBeNull()
  })

})

describe('calculerPoidsRelatif', () => {
  it('divise par le total des superficies ajustées, nouvel emplacement compris', () => {
    expect(calculerPoidsRelatif(875, 3008.75)).toBeCloseTo(875 / 3883.75)
  })

  it('vaut 100 % pour le premier emplacement', () => {
    expect(calculerPoidsRelatif(50, 0)).toBe(1)
  })

  it('reste vide sans superficie ajustée ou si le total est nul', () => {
    expect(calculerPoidsRelatif(null, 1000)).toBeNull()
    expect(calculerPoidsRelatif(0, 0)).toBeNull()
  })
})

describe('calculerValeurToponymique', () => {
  it('multiplie le poids relatif par la valorisation totale, arrondi au dollar', () => {
    expect(calculerValeurToponymique(0.2253, 1_000_000)).toBe(225300)
    expect(calculerValeurToponymique(0.5, '333')).toBe(167)
  })

  it('reste vide sans poids relatif ou sans valorisation', () => {
    expect(calculerValeurToponymique(null, 1_000_000)).toBeNull()
    expect(calculerValeurToponymique(0.2, '')).toBeNull()
    expect(calculerValeurToponymique(0.2, 'abc')).toBeNull()
  })
})

describe('useCalculsEmplacement en modification', () => {
  it('retire la superficie actuelle de l’emplacement du total, pour ne pas la compter deux fois', () => {
    const facteurs = { fl: [{ id: 6, fl: 1.75 }], ff: [{ id: 8, ff: 2 }], totalSuperficieAjustee: 3883.75 }
    const formulaire = reactive({ superficie: 250, fl_id: 6, ff_id: 8, valorisation_totale: '' })

    const { poidsRelatif } = useCalculsEmplacement(formulaire, facteurs, 875)

    expect(poidsRelatif.value).toBeCloseTo(875 / 3883.75)
  })
})
