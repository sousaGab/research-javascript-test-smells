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

  expect(getInstanceFromVNode(outer)).toBeDefined()
  
  const instance = getInstanceFromVNode(outer)
  const expectedName = isVue3 ? undefined : 'BVTransporterTarget'
  if (expectedName) {
    expect(instance.$options.name).toBe(expectedName)
  }

  expect(outer.parentElement).toBeDefined()
  expect(outer.parentElement).toBe(document.body)

  wrapper.destroy()

  await waitNT(wrapper.vm)
  await waitRAF()

  expect(outer.parentElement).toEqual(null)
})