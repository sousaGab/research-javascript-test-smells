it('$bvModal.msgBoxOk() works', async () => {
  const App = {
    render(h) {
      return h('div', 'app')
    }
  }

  const wrapper = mount(App, { attachTo: document.body })
  const { vm } = wrapper

  const flushAll = async () => {
    for (let i = 0; i < 3; i++) {
      await waitNT(vm)
      await waitRAF()
    }
  }

  expect(vm).toBeDefined()
  expect(vm.$bvModal).toBeDefined()

  const { msgBoxOk } = vm.$bvModal
  expect(msgBoxOk).toBeDefined()

  const p = msgBoxOk('message', {
    static: true,
    id: 'test2',
    title: 'title'
  })

  expect(p).toBeDefined()
  expect(p).toBeInstanceOf(Promise)

  await flushAll()

  const modal = document.querySelector('#test2')
  expect(modal).toBeDefined()
  expect(modal).not.toEqual(null)

  const $modal = createWrapper(modal)
  expect($modal.element.tagName).toBe('DIV')

  const buttons = $modal.findAll('button')
  expect(buttons.length).toBe(1)

  const $button = buttons.at(0)
  expect($button.text()).toEqual('OK')

  await $button.trigger('click')

  const result = await p
  expect(result).toEqual(true)

  await flushAll()

  expect(document.querySelector('#test2')).toBe(null)
})