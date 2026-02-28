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

  // Show the modal and get the promise
  const promise = wrapper.vm.$bvModal.msgBoxOk('message', {
    static: true,
    id: 'test2',
    title: 'title'
  })

  expect(promise).toBeInstanceOf(Promise)

  await waitForModalTransition()

  // Find the modal
  const modal = document.querySelector('#test2')
  expect(modal).not.toBeNull()
  const $modal = createWrapper(modal)

  // Find the OK button and click it
  const $button = $modal.find('button')
  expect($button.text()).toEqual('OK')
  await $button.trigger('click')

  // Promise should now resolve to true
  await expect(promise).resolves.toBe(true)

  await waitForModalTransition()

  // Modal should be gone from DOM
  expect(document.querySelector('#test2')).toBeNull()
})