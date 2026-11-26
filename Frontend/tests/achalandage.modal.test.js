/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AchalandageInfo from '../src/components/AchalandageInfo.vue'

describe('AchalandageInfo', () => {
  it('affiche les 8 niveaux sans exposer le facteur interne', () => {
    const wrapper = mount(AchalandageInfo, {
      props: {
        isOpen: true,
        currentLevel: 4,
      },
    })

    const levels = wrapper.findAll('[data-level-id]')
    expect(levels).toHaveLength(8)

    const text = wrapper.text()
    expect(text).toContain('3 à 19 pers.')
    expect(text).toContain('2 700 pers. et +')
    expect(text).not.toContain('0.25')
    expect(text).not.toContain('1.75')
  })

  it('surligne uniquement le niveau correspondant à currentLevel', () => {
    const wrapper = mount(AchalandageInfo, {
      props: {
        isOpen: true,
        currentLevel: 6,
      },
    })

    const level6 = wrapper.find('[data-level-id="6"]')
    const level3 = wrapper.find('[data-level-id="3"]')

    expect(level6.classes()).toContain('bg-teal-50')
    expect(level6.classes()).toContain('font-semibold')
    expect(level3.classes()).not.toContain('bg-teal-50')
  })

  it('émet close lors du clic sur le bouton fermer', async () => {
    const wrapper = mount(AchalandageInfo, {
      props: {
        isOpen: true,
        currentLevel: 2,
      },
    })

    await wrapper.find('button[aria-label="Fermer"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
