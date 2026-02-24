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

  // Trigger the modal and confirm it returns a promise
  const promise = wrapper.vm.$bvModal.msgBoxOk('message', {
    static: true,
    id: 'test2',
    title: 'title'
  })
  expect(promise).toBeInstanceOf(Promise)

  await waitForModalTransition()

  // Check that the modal appeared in the DOM
  const modal = document.querySelector('#test2')
  expect(modal).not.toBeNull()
  const $modal = createWrapper(modal)

  // Find the OK button, check its content, and click it
  const okButton = $modal.find('button')
  expect(okButton.text()).toBe('OK')
  await okButton.trigger('click')

  // Await the promise and check the resolved value
  const result = await promise
  expect(result).toBe(true)

  await waitForModalTransition()

  // Check that the modal was removed from the DOM
  expect(document.querySelector('#test2')).toBeNull()
})