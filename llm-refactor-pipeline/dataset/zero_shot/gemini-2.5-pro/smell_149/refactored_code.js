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
  expect(outer).not.toBe(null)
  expect(outer.parentElement).toBe(document.body)
  expect(getInstanceFromVNode(outer)).toBeDefined() // Target

  // Destroy modal
  wrapper.destroy()

  await waitNT(wrapper.vm)
  await waitRAF()

  // Should no longer be in document
  expect(document.getElementById('test-target___BV_modal_outer_')).toBe(null)
})