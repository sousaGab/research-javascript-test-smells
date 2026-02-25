describe('when disabled=false', () => {
  it('transports content to document.body and cleans up on destroy', async () => {
    const App = {
      render(h) {
        return h(BVTransporter, { props: { disabled: false } }, [
          h('div', { attrs: { id: 'foobar' } }, 'content')
        ])
      }
    }

    const wrapper = mount(App, {
      attachTo: document.body
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)

    // It renders a placeholder comment node in its original location
    expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

    // The content is transported to the body
    const target = document.getElementById('foobar')
    expect(target).not.toBe(null)
    expect(target.tagName).toEqual('DIV')
    expect(target.parentElement).toBe(document.body)

    // It cleans up when the component is destroyed
    wrapper.destroy()
    await waitNT(wrapper.vm)
    expect(document.getElementById('foobar')).toBe(null)
  })

  if (!isVue3) {
    it('wraps transported content in a BVTransporterTarget component in Vue 2', async () => {
      const App = {
        render(h) {
          return h(BVTransporter, { props: { disabled: false } }, [
            h('div', { attrs: { id: 'foobar' } }, 'content')
          ])
        }
      }

      const wrapper = mount(App, {
        attachTo: document.body
      })

      await waitNT(wrapper.vm)

      const target = document.getElementById('foobar')
      expect(getInstanceFromVNode(target)).toBeDefined()
      expect(getInstanceFromVNode(target).$options.name).toBe('BVTransporterTarget')

      wrapper.destroy()
      await waitNT(wrapper.vm)
    })
  }
})