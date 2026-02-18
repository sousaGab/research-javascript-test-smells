it('$bvModal.msgBoxOk() works', async () => {
  const App = {
    render(h) {
      return h('div', 'app')
    }
  }
  const wrapper = mount(App, {
    attachTo: document.body
  })

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
  expect(p).toBeInstanceOf(Promise)

  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()

  // Find the modal
  const modal = document.querySelector('#test2')
  expect(modal).toBeInTheDocument()
  const $modal = createWrapper(modal)
  expect($modal.element.tagName).toBe('DIV')

  // Find the OK button and click it
  expect($modal.findAll('button')).toHaveLength(1)
  const $button = $modal.find('button')
  expect($button.text()).toBe('OK')
  await $button.trigger('click')

  // Promise should now resolve
  const result = await p
  expect(result).toBe(true)

  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()

  // Modal should be gone from DOM
  expect(document.querySelector('#test2')).not.toBeInTheDocument()
})