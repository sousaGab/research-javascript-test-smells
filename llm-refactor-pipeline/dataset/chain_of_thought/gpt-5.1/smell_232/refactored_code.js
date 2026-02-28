it('$bvModal.msgBoxOk() works', async () => {
  const App = {
    render(h) {
      return h('div', 'app')
    }
  }

  const flushAll = async vm => {
    for (let i = 0; i < 3; i++) {
      await waitNT(vm)
      await waitRAF()
    }
  }

  const wrapper = mount(App, { attachTo: document.body })

  expect(wrapper.vm).toBeDefined()
  expect(wrapper.vm.$bvModal).toBeDefined()

  const bvModal = wrapper.vm.$bvModal
  expect(bvModal.msgBoxOk).toBeDefined()

  const p = bvModal.msgBoxOk('message', {
    static: true,
    id: 'test2',
    title: 'title'
  })

  expect(p).toBeDefined()
  expect(p).toBeInstanceOf(Promise)

  await flushAll(wrapper.vm)

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

  await flushAll(wrapper.vm)

  expect(document.querySelector('#test2')).toBe(null)
})