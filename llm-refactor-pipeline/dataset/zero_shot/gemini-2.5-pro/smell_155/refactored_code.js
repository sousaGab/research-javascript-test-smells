describe('when disabled=false', () => {
  const App = {
    render(h) {
      return h(BVTransporter, { props: { disabled: false } }, [
        h('div', { attrs: { id: 'foobar' } }, 'content')
      ])
    }
  }

  it('transports content to body and cleans up on destroy', async () => {
    const wrapper = mount(App, {
      attachTo: document.body
    })

    expect(wrapper.vm).toBeDefined()

    await waitNT(wrapper.vm)

    expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

    const target = document.getElementById('foobar')
    expect(target).toBeDefined()
    expect(target).not.toBe(null)
    expect(getInstanceFromVNode(target)).toBeDefined()
    expect(target.tagName).toEqual('DIV')
    expect(target.parentElement).toBeDefined()
    expect(target.parentElement).toBe(document.body)

    wrapper.destroy()

    await waitNT(wrapper.vm)

    expect(target.parentElement).toEqual(null)
  })

  if (!isVue3) {
    it('creates a BVTransporterTarget component instance (Vue 2 only)', async () => {
      const wrapper = mount(App, {
        attachTo: document.body
      })

      await waitNT(wrapper.vm)

      const target = document.getElementById('foobar')
      expect(getInstanceFromVNode(target).$options.name).toBe('BVTransporterTarget')

      wrapper.destroy()
      await waitNT(wrapper.vm)
    })
  }
})