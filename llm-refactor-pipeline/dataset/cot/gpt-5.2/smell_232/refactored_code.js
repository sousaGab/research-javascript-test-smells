it('$bvModal.msgBoxOk() works', async () => {
  const App = {
    render(h) {
      return h('div', 'app')
    }
  }

  const wrapper = mount(App, { attachTo: document.body })

  const flushUi = async (vm, times = 3) => {
    for (let i = 0; i < times; i++) {
      await waitNT(vm)
      await waitRAF()
    }
  }

  expect(wrapper.vm).toBeDefined()

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

  await flushUi(wrapper.vm)

  // Find the modal
  const modal = document.querySelector('#test2')
  expect(modal).toBeDefined()
  expect(modal).not.toEqual(null)
  const $modal = createWrapper(modal)
  expect($modal.element.tagName).toBe('DIV')

  // Find the OK button and click it
  expect($modal.findAll('button').length).toBe(1)
  const $button = $modal.find('button')
  expect($button.text()).toEqual('OK')
  await $button.trigger('click')

  // Promise should now resolve
  const result = await p
  expect(result).toEqual(true)

  await flushUi(wrapper.vm)

  // Modal should be gone from DOM
  expect(document.querySelector('#test2')).toBe(null)
})