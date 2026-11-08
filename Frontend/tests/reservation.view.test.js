
/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import ReservationView from '../src/views/page_reserver.vue'
import { useAuthStore } from '../src/stores/auth.js'
import { usePlotsStore } from '../src/stores/plots.js'
import { useReservationStore } from '../src/stores/reservations.js'

vi.mock('../src/stores/auth.js', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('../src/stores/plots.js', () => ({
  usePlotsStore: vi.fn()
}))

vi.mock('../src/stores/reservations.js', () => ({
  useReservationStore: vi.fn()
}))

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useRoute: () => ({
    params: { id: '3' },
    query: {}
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}))

beforeEach(() => {
  vi.resetAllMocks()

  useAuthStore.mockReturnValue({
    currentUser: { id: 1 },
    users: [],
    logout: vi.fn()
  })

  usePlotsStore.mockReturnValue({
    plot: { id: 3, name: 'Emplacement test' },
    plots: [],
    getPlotById: vi.fn().mockResolvedValue({})
  })

  useReservationStore.mockReturnValue({
    reservations: [],
    reservedPeriods: [
      {
        start: '2026-11-10',
        end: '2026-11-15'
      }
    ],
    loading: false,
    error: null,
    getReservedPeriods: vi.fn().mockResolvedValue([]),
    addReservation: vi.fn()
  })
})

describe('Calendrier de réservation', () => {

  it('bloque les dates confirmées et autorise les dates libres', async () => {
    const wrapper = shallowMount(ReservationView)

    await flushPromises()

    const datePicker = wrapper.findComponent(VueDatePicker)

    expect(datePicker.exists()).toBe(true)

    const disabledDates = datePicker.props('disabledDates')

    expect(disabledDates(new Date(2026, 10, 12))).toBe(true)
    expect(disabledDates(new Date(2026, 10, 16))).toBe(false)

    wrapper.unmount()
  })

})
