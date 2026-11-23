/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MapComponent from '../src/components/Map.vue'
import { hospitals } from '../src/data/mockData.js'
import { usePlotsStore } from '../src/stores/plots.js'
import { useEtagesStore } from '../src/stores/etages.js'
import { useReservationStore } from '../src/stores/reservations.js'
import { useToastStore } from '../src/stores/toast.js'

vi.mock('../src/stores/plots.js', () => ({
  usePlotsStore: vi.fn(),
}))

vi.mock('../src/stores/etages.js', () => ({
  useEtagesStore: vi.fn(),
}))

vi.mock('../src/stores/reservations.js', () => ({
  useReservationStore: vi.fn(),
}))

vi.mock('../src/stores/toast.js', () => ({
  useToastStore: vi.fn(() => ({ show: vi.fn(), close: vi.fn() })),
}))

describe('MapComponent (Map.vue)', () => {
  let mockEtagesStore

  beforeEach(() => {
    vi.resetAllMocks()

    usePlotsStore.mockReturnValue({
      plots: [
        { id: 1, hospital: 'CHUL', name: 'Hall principal' },
        { id: 2, hospital: 'NCH', name: 'Atrium' },
      ],
    })

    useReservationStore.mockReturnValue({
      allConfirmedReservations: [],
      getAllConfirmedReservations: vi.fn(),
      formatDate: vi.fn((d) => (d ? '2026-06-01' : '')),
      isEmplacementAvailable: vi.fn(() => true),
    })

    mockEtagesStore = {
      etages: [
        {
          id: 1,
          niveau: 0,
          nom: 'Rez-de-chaussée (RDC)',
          pins: [
            {
              id: 1,
              emplacement_id: 1,
              x: 0.35,
              y: 0.45,
              no_local_pavillon: 'CHUL-RC-001',
              lieu_specifique: 'Hall principal',
              statut: 'Disponible',
              valeur_toponymique: 50000,
            },
          ],
        },
        {
          id: 2,
          niveau: 2,
          nom: '2e Étage',
          pins: [],
        },
      ],
      currentEtage: {
        id: 1,
        niveau: 0,
        nom: 'Rez-de-chaussée (RDC)',
        pins: [
          {
            id: 1,
            emplacement_id: 1,
            x: 0.35,
            y: 0.45,
            no_local_pavillon: 'CHUL-RC-001',
            lieu_specifique: 'Hall principal',
            statut: 'Disponible',
            valeur_toponymique: 50000,
          },
        ],
      },
      selectedPin: null,
      fetchEtagesByHospital: vi.fn(),
      selectEtage: vi.fn(),
      selectPin: vi.fn(),
      createPin: vi.fn(),
      deletePin: vi.fn(),
    }

    useEtagesStore.mockReturnValue(mockEtagesStore)
  })

  it('affiche correctement le titre et les 4 cartes des hôpitaux du CHU', () => {
    const wrapper = mount(MapComponent, {
      props: {
        hospitals,
        activeHospital: '',
        searchQuery: '',
      },
    })

    expect(wrapper.text()).toContain("Carte des sites & Plans d'étages")
    expect(wrapper.text()).toContain('Réseau hospitalier du CHU de Québec')

    // Les 4 cartes d'hôpitaux sont présentes
    expect(wrapper.text()).toContain('CHUL')
    expect(wrapper.text()).toContain('NCH')
    expect(wrapper.text()).toContain('HSFA')
    expect(wrapper.text()).toContain('HSS')

    wrapper.unmount()
  })

  it('émet select-hospital avec le code de l\'hôpital au clic sur une carte', async () => {
    const wrapper = mount(MapComponent, {
      props: {
        hospitals,
        activeHospital: '',
        searchQuery: '',
      },
    })

    const chulCard = wrapper.findAll('button').find((b) => b.text().includes('CHUL'))
    expect(chulCard).toBeDefined()

    await chulCard.trigger('click')

    expect(wrapper.emitted('select-hospital')).toBeTruthy()
    expect(wrapper.emitted('select-hospital')[0]).toEqual(['CHUL'])

    wrapper.unmount()
  })

  it('affiche le système d\'étage lorsqu\'un hôpital est sélectionné', async () => {
    const wrapper = mount(MapComponent, {
      props: {
        hospitals,
        activeHospital: 'CHUL',
        searchQuery: '',
      },
    })

    expect(wrapper.text()).toContain('Site ciblé : CHUL')
    // Le composant FloorPlanView est affiché avec ses étages
    expect(wrapper.text()).toContain('Rez-de-chaussée (RDC)')
    expect(wrapper.text()).toContain('CHUL-RC-001')

    wrapper.unmount()
  })

  it('permet de réinitialiser la sélection et revenir à la vue globale', async () => {
    const wrapper = mount(MapComponent, {
      props: {
        hospitals,
        activeHospital: 'CHUL',
        searchQuery: '',
      },
    })

    const resetBtn = wrapper.findAll('button').find((b) => b.text().includes('Vue globale'))
    expect(resetBtn).toBeDefined()
    await resetBtn.trigger('click')

    expect(wrapper.emitted('select-hospital')).toBeTruthy()
    expect(wrapper.emitted('select-hospital')[0]).toEqual([''])

    wrapper.unmount()
  })

  it('se monte et se démonte proprement sans lever d\'erreur Leaflet et supporte le re-montage', async () => {
    const wrapper = mount(MapComponent, {
      props: {
        hospitals,
        activeHospital: '',
      },
    })

    expect(() => wrapper.unmount()).not.toThrow()

    const wrapper2 = mount(MapComponent, {
      props: {
        hospitals,
        activeHospital: 'NCH',
      },
    })

    expect(wrapper2.text()).toContain('NCH')
    await wrapper2.setProps({ activeHospital: 'HSFA' })
    await wrapper2.setProps({ activeHospital: '' })

    expect(() => wrapper2.unmount()).not.toThrow()
  })
})
