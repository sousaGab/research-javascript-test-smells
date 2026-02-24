it('renders appended to body when initially open and not static', async () => {
  const wrapper = mount(BModal, {
    attachTo: document.body,
    propsData: {
      static: false,
      id: 'test-target',
      visible: true
    }
  })

  expect(wrapper.vm).toBeDefined()

  await waitRAF()
  expect(wrapper.element.nodeType).toEqual(Node.COMMENT_NODE)

  const outer = document.getElementById('test-target___BV_modal_outer_')
  expect(outer).toBeDefined()
  expect(outer).not.toBe(null)

  expect(getInstanceFromVNode(outer)).toBeDefined() // Target
  expect(outer.parentElement).toBeDefined()
  expect(outer.parentElement).toBe(document.body)

  // Destroy modal
  wrapper.destroy()

  await waitNT(wrapper.vm)
  await waitRAF()

  // Should no longer be in document
  expect(outer.parentElement).toEqual(null)
})

it.skip(isVue3)('renders transporter target with correct component name on Vue 2', async () => {
  const wrapper = mount(BModal, {
    attachTo: document.body,
    propsData: {
      static: false,
      id: 'test-target',
      visible: true
    }
  })

  await waitRAF()

  const outer = document.getElementById('test-target___BV_modal_outer_')
  expect(getInstanceFromVNode(outer)).toBeDefined()
  expect(getInstanceFromVNode(outer).$options.name).toBe('BVTransporterTarget')

  // Destroy modal
  wrapper.destroy()
  await waitNT(wrapper.vm)
  await waitRAF()
})