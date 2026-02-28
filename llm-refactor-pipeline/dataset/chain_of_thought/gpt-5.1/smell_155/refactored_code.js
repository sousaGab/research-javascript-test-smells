it('does not render in-pace when disabled=false', async () => {
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
  expect(target).toBeDefined()
  expect(target).not.toBe(null)
  const instance = getInstanceFromVNode(target)
  expect(instance).toBeDefined() // Target
  expect(target.tagName).toEqual('DIV')
  expect(target.parentElement).toBeDefined()
  expect(target.parentElement).toBe(document.body)

  if (!isVue3) {
    expect(instance.$options.name).toBe('BVTransporterTarget')
  }

  wrapper.destroy()

  await waitNT(wrapper.vm)

  expect(target.parentElement).toEqual(null)
})