// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AddPlotView from '../src/views/AddPlotView.vue'
import { useEmplacementsStore } from '../src/stores/emplacements.js'

vi.mock('vue-router', () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
  RouterLink: { template: '<a><slot /></a>' },
}))

const FACTEURS = {
  fl: [
    { id: 1, fl: 0.25, type_lieu: 'Salle du personnel' },
    { id: 6, fl: 1.75, type_lieu: 'Espaces publics' },
  ],
  ff: [
    { id: 1, ff: 0.25, nbr_personnes: 3 },
    { id: 8, ff: 2, nbr_personnes: 2700 },
  ],
  totalSuperficieAjustee: 3008.75,
}

let store

beforeEach(async () => {
  setActivePinia(createPinia())
  store = useEmplacementsStore()
  vi.spyOn(store, 'fetchHospitals').mockImplementation(async () => {
    store.hopitaux = [{ id: 1, nom: 'CHUL' }]
  })
  vi.spyOn(store, 'fetchFacteurs').mockImplementation(async () => {
    store.facteurs = FACTEURS
  })
})

async function monter() {
  const wrapper = mount(AddPlotView, { global: { stubs: { RouterLink: true } } })
  await flushPromises()
  return wrapper
}

describe('AddPlotView — champs calculés', () => {
  it('recalcule en direct à chaque changement', async () => {
    const wrapper = await monter()

    await wrapper.find('#superficie').setValue('250')
    await wrapper.find('#fl_id').setValue(6)
    await wrapper.find('#ff_id').setValue(8)

    expect(wrapper.find('output#superficie_ajuste').text()).toBe('875 m²')
    expect(wrapper.find('output#poid_relatif').text()).toMatch(/^22,53\s?%$/)

    await wrapper.find('#valorisation_totale').setValue('1000000')
    expect(wrapper.find('output#valeur_toponymique').text().replace(/\s/g, ' ')).toBe('225 298 $')

    await wrapper.find('#superficie').setValue('100')
    expect(wrapper.find('output#superficie_ajuste').text()).toBe('350 m²')
  })

  it('n’envoie pas les champs calculés au serveur', async () => {
    const addPlot = vi.spyOn(store, 'addPlot').mockResolvedValue(false)
    const wrapper = await monter()

    await wrapper.find('#composante_id').setValue(1)
    await wrapper.find('#lieu_specifique').setValue('Hall')
    await wrapper.find('#superficie').setValue('250')
    await wrapper.find('#fl_id').setValue(6)
    await wrapper.find('#ff_id').setValue(8)
    await wrapper.find('#valorisation_totale').setValue('1000000')
    await wrapper.find('form').trigger('submit')

    const envoye = addPlot.mock.calls[0][0]
    expect(envoye).toMatchObject({ superficie: 250, fl_id: 6, ff_id: 8 })
    expect(envoye).not.toHaveProperty('superficie_ajuste')
    expect(envoye).not.toHaveProperty('poid_relatif')
    expect(envoye).not.toHaveProperty('valorisation_totale')
    expect(envoye.valeur_toponymique).toBe(Math.round((875 / 3883.75) * 1_000_000))
  })
})
