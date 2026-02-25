it('$bvModal.msgBoxOk() works', async () => {
  const App = {
    render(h) {
      return h('div', 'app')
    }
  }
  const wrapper = mount(App, {
    attachTo: document.body
  })

  const waitForModalTransition = async () => {
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
  }

  const promise = wrapper.vm.$bvModal.msgBoxOk('message', {
    static: true,
    id: 'test2',
    title: 'title'
  })
  expect(promise).toBeInstanceOf(Promise)

  await waitForModalTransition()

  const modal = document.querySelector('#test2')
  expect(modal).not.toBeNull()
  const $modal = createWrapper(modal)

  const $button = $modal.find('button')
  expect($button.exists()).toBe(true)
  expect($button.text()).toEqual('OK')
  await $button.trigger('click')

  await expect(promise).resolves.toBe(true)

  await waitForModalTransition()

  expect(document.querySelector('#test2')).toBe(null)
})