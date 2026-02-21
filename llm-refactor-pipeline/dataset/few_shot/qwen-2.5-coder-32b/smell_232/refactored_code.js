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
    const bvModal = wrapper.vm.$bvModal
    expect(bvModal).toBeDefined()
    expect(bvModal.msgBoxOk).toBeDefined()

    const p = bvModal.msgBoxOk('message', {
      static: true,
      id: 'test2',
      title: 'title'
    })
    expect(p).toBeDefined()
    expect(p).toBeInstanceOf(Promise)

    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()

    const modal = document.querySelector('#test2')
    expect(modal).toBeDefined()
    const $modal = createWrapper(modal)
    expect($modal.element.tagName).toBe('DIV')

    const $button = $modal.find('button')
    expect($button.text()).toEqual('OK')
    await $button.trigger('click')

    const result = await p
    expect(result).toEqual(true)

    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(document.querySelector('#test2')).toBe(null)
  })