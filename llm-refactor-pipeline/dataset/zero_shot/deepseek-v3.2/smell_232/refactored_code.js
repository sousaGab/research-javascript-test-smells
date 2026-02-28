it('$bvModal.msgBoxOk() works', async () => {
  const App = {
    render(h) {
      return h('div', 'app')
    }
  }
  const wrapper = mount(App, { attachTo: document.body })
  const bvModal = wrapper.vm.$bvModal

  const modalPromise = bvModal.msgBoxOk('message', {
    static: true,
    id: 'test2',
    title: 'title'
  })

  expect(modalPromise).toBeInstanceOf(Promise)

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
  expect(result).toBe(true)

  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()
  await waitNT(wrapper.vm)
  await waitRAF()

  expect(document.querySelector('#test2')).toBeNull()
})