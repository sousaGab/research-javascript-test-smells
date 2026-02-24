it('$bvModal.msgBoxOk() works', async () => {
  const App = {
    render(h) {
      return h('div', 'app')
    }
  }

  const wrapper = mount(App, { attachTo: document.body })

  const { vm } = wrapper
  expect(vm).toBeDefined()

  const { $bvModal } = vm
  expect($bvModal).toBeDefined()
  expect($bvModal.msgBoxOk).toBeDefined()

  const p = $bvModal.msgBoxOk('message', {
    static: true,
    id: 'test2',
    title: 'title'
  })
  expect(p).toBeDefined()
  expect(p).toBeInstanceOf(Promise)

  const flushTimers = async () => {
    await waitNT(vm)
    await waitRAF()
  }

  await flushTimers()
  await flushTimers()
  await flushTimers()

  const modal = document.querySelector('#test2')
  expect(modal).toBeDefined()
  expect(modal).not.toEqual(null)

  const $modal = createWrapper(modal)
  expect($modal.element.tagName).toBe('DIV')

  const buttons = $modal.findAll('button')
  expect(buttons.length).toBe(1)

  const $button = $modal.find('button')
  expect($button.text()).toEqual('OK')
  await $button.trigger('click')

  const result = await p
  expect(result).toEqual(true)

  await flushTimers()
  await flushTimers()
  await flushTimers()

  expect(document.querySelector('#test2')).toBe(null)
})