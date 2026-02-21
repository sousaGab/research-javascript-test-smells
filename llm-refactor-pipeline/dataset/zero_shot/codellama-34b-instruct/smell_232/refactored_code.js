import { createWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { waitNT, waitRAF } from '@vue/test-utils'

const setup = () => {
  const App = {
    render(h) {
      return h('div', 'app')
    }
  }
  const wrapper = mount(App, {
    attachTo: document.body
  })
  return { wrapper }
}

const assertModal = (modal) => {
  expect(modal).toBeDefined()
  expect(modal).not.toEqual(null)
  const $modal = createWrapper(modal)
  expect($modal.element.tagName).toBe('DIV')
}

const assertButton = (button) => {
  expect(button).toBeDefined()
  expect(button.text()).toEqual('OK')
}

const assertResult = (result) => {
  expect(result).toEqual(true)
}

it('$bvModal.msgBoxOk() works', async () => {
  const { wrapper } = setup()

  // `$bvModal.msgBoxOk`
  expect(wrapper.vm.$bvModal).toBeDefined()
  const bvModal = wrapper.vm.$bvModal
  expect(bvModal.msgBoxOk).toBeDefined()

  // Should get a promise as result
  const p = bvModal.msgBoxOk('message', {
    static: true,
    id: 'test2',
    title: 'title'
  })
  expect(p).toBeDefined()
  expect(p).toBeInstanceOf(Promise)

  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()

  // Find the modal
  const modal = document.querySelector('#test2')
  assertModal(modal)

  // Find the OK button and click it
  const button = modal.querySelector('button')
  assertButton(button)
  await button.trigger('click')

  // Promise should now resolve
  const result = await p
  assertResult(result)

  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()

  // Modal should be gone from DOM
  expect(document.querySelector('#test2')).toBe(null)
})