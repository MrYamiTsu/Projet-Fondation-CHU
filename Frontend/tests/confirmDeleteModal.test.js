// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ConfirmDeleteModal from '../src/components/ConfirmDeleteModal.vue'

function monter(props = {}) {
  return mount(ConfirmDeleteModal, {
    props: {
      isOpen: true,
      itemName: 'Hall principal',
      itemDetails: 'Local A-101 · CHUL',
      consequences: ['Son repère sur le plan d’étage sera retiré.'],
      onConfirm: vi.fn().mockResolvedValue(),
      ...props,
    },
    global: { stubs: { teleport: true, transition: false } },
  })
}

const bouton = (wrapper, texte) => wrapper.findAll('button').find((b) => b.text().includes(texte))

describe('ConfirmDeleteModal', () => {
  it('étape 1 : présente l’élément et ses conséquences sans rien supprimer', () => {
    const wrapper = monter()

    expect(wrapper.text()).toContain('Étape 1 sur 2')
    expect(wrapper.text()).toContain('Hall principal')
    expect(wrapper.text()).toContain('Local A-101 · CHUL')
    expect(wrapper.text()).toContain('Son repère sur le plan d’étage sera retiré.')
    expect(wrapper.text()).toContain('Aucune restauration possible')
    expect(bouton(wrapper, 'Supprimer définitivement')).toBeUndefined()
  })

  it('étape 2 : le bouton reste désactivé tant que le mot n’est pas tapé', async () => {
    const wrapper = monter()
    await bouton(wrapper, 'Continuer').trigger('click')

    expect(wrapper.text()).toContain('Étape 2 sur 2')
    const supprimer = bouton(wrapper, 'Supprimer définitivement')
    expect(supprimer.attributes('disabled')).toBeDefined()

    await wrapper.find('input').setValue('supprim')
    expect(supprimer.attributes('disabled')).toBeDefined()

    await wrapper.find('input').setValue('  supprimer ')
    expect(supprimer.attributes('disabled')).toBeUndefined()
  })

  it('supprime après les deux confirmations puis se ferme', async () => {
    const onConfirm = vi.fn().mockResolvedValue()
    const wrapper = monter({ onConfirm })

    await bouton(wrapper, 'Continuer').trigger('click')
    await wrapper.find('input').setValue('SUPPRIMER')
    await bouton(wrapper, 'Supprimer définitivement').trigger('click')
    await flushPromises()

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(wrapper.emitted('deleted')).toHaveLength(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('Entrée dans le champ ne supprime pas si le mot est incorrect', async () => {
    const onConfirm = vi.fn()
    const wrapper = monter({ onConfirm })

    await bouton(wrapper, 'Continuer').trigger('click')
    await wrapper.find('input').setValue('oui')
    await wrapper.find('input').trigger('keydown', { key: 'Enter' })

    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('affiche l’erreur du serveur et reste ouverte si la suppression échoue', async () => {
    const onConfirm = vi
      .fn()
      .mockRejectedValue(new Error('Impossible de supprimer un emplacement qui a des réservations'))
    const wrapper = monter({ onConfirm })

    await bouton(wrapper, 'Continuer').trigger('click')
    await wrapper.find('input').setValue('SUPPRIMER')
    await bouton(wrapper, 'Supprimer définitivement').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toContain('réservations')
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(wrapper.emitted('deleted')).toBeUndefined()
  })

  it('Annuler ferme sans supprimer', async () => {
    const onConfirm = vi.fn()
    const wrapper = monter({ onConfirm })

    await bouton(wrapper, 'Annuler').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('repart de l’étape 1 à chaque ouverture', async () => {
    const wrapper = monter()
    await bouton(wrapper, 'Continuer').trigger('click')
    await wrapper.find('input').setValue('SUPPRIMER')

    await wrapper.setProps({ isOpen: false })
    await wrapper.setProps({ isOpen: true })

    expect(wrapper.text()).toContain('Étape 1 sur 2')
    expect(wrapper.find('input').exists()).toBe(false)
  })
})
