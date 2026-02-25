describe('when disabled=false', () => {
  // Test for Vue 2 specific behavior
  it.skipIf(isVue3, 'does not render in-pace and has correct component name (Vue 2)', async () => {
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

    expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

    const target = document.getElementById('foobar')
    expect(target).not.toBe(null)
    expect(getInstanceFromVNode(target)).toBeDefined()
    expect(getInstanceFromVNode(target).$options.name).toBe('BVTransporterTarget')
    expect(target.tagName).toEqual('DIV')
    expect(target.parentElement).toBe(document.body)

    wrapper.destroy()
    await waitNT(wrapper.vm)

    expect(target.parentElement).toEqual(null)
  })

  // Test for Vue 3 behavior
  it.skipIf(!isVue3, 'does not render in-pace (Vue 3)', async () => {
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

    expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

    const target = document.getElementById('foobar')
    expect(target).not.toBe(null)
    expect(getInstanceFromVNode(target)).toBeDefined()
    expect(target.tagName).toEqual('DIV')
    expect(target.parentElement).toBe(document.body)

    wrapper.destroy()
    await waitNT(wrapper.vm)

    expect(target.parentElement).toEqual(null)
  })
})