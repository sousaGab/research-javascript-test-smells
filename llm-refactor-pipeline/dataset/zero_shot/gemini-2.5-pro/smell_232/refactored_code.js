it('$bvModal.msgBoxOk() works', async () => {
  const App = {
    render(h) {
      return h('div', 'app')
    }
  }
  const wrapper = mount(App, {
    attachTo: document.body
  })

  // Helper to wait for modal transitions
  const waitForModalTransition = async () => {
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
  }

  // Trigger the modal and get the promise
  const resultPromise = wrapper.vm.$bvModal.msgBoxOk('message', {
    static: true,
    id: 'test2',
    title: 'title'
  })

  await waitForModalTransition()

  // Verify modal is in the DOM
  const modal = document.querySelector('#test2')
  expect(modal).not.toBeNull()
  const $modal = createWrapper(modal)
  expect($modal.element.tagName).toBe('DIV')

  // Find and click the OK button
  const buttons = $modal.findAll('button')
  expect(buttons.length).toBe(1)
  const okButton = buttons.at(0)
  expect(okButton.text()).toBe('OK')
  await okButton.trigger('click')

  // Promise should resolve to true after click
  await expect(resultPromise).resolves.toBe(true)

  await waitForModalTransition()

  // Modal should be gone from DOM
  expect(document.querySelector('#test2')).toBeNull()
})