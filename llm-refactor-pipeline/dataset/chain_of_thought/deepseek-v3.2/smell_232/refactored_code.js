it('$bvModal.msgBoxOk() works', async () => {
  const App = {
    render(h) {
      return h('div', 'app')
    }
  }
  const wrapper = mount(App, {
    attachTo: document.body
  })

  const bvModal = wrapper.vm.$bvModal
  const modalPromise = bvModal.msgBoxOk('message', {
    static: true,
    id: 'test2',
    title: 'title'
  })

  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()

  const modal = document.querySelector('#test2')
  const $modal = createWrapper(modal)
  const $button = $modal.find('button')

  await $button.trigger('click')

  const result = await modalPromise

  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()

  expect(wrapper.vm).toBeDefined()
  expect(wrapper.vm.$bvModal).toBeDefined()
  expect(bvModal.msgBoxOk).toBeDefined()
  expect(modalPromise).toBeInstanceOf(Promise)
  expect(modal).not.toBeNull()
  expect($modal.element.tagName).toBe('DIV')
  expect($modal.findAll('button')).toHaveLength(1)
  expect($button.text()).toBe('OK')
  expect(result).toBe(true)
  expect(document.querySelector('#test2')).toBeNull()
})