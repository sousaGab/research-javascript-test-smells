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
    expect(wrapper.vm.$bvModal).toBeDefined()

    const bvModal = wrapper.vm.$bvModal

    expect(bvModal.msgBoxOk).toBeDefined()

    const p = bvModal.msgBoxOk('message', {
      static: true,
      id: 'test2',
      title: 'title'
    })

    expect(p).toBeInstanceOf(Promise)

    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()

    const modal = document.querySelector('#test2')
    expect(modal).not.toEqual(null)

    const $modal = createWrapper(modal)
    expect($modal.element.tagName).toBe('DIV')
    expect($modal.findAll('button').length).toBe(1)

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