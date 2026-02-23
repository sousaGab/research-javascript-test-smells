describe('BToaster with aria props', () => {
  const mountToaster = () => {
    return mount(BToaster, {
      attachTo: document.body,
      propsData: {
        name: 'bar',
        ariaLive: 'assertive',
        ariaAtomic: 'true',
        role: 'alert'
      }
    })
  }

  const assertBaseStructureAndAttributes = async (wrapper) => {
    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('id')).toBe('bar')
    expect(wrapper.attributes('aria-live')).toEqual('assertive')
    expect(wrapper.attributes('aria-atomic')).toEqual('true')
    expect(wrapper.attributes('role')).toEqual('alert')

    const $slot = wrapper.find('.b-toaster-slot')
    expect($slot.exists()).toBe(true)
    expect($slot.element.tagName).toBe('DIV')
    expect($slot.classes()).toContain('b-toaster-slot')
    expect($slot.classes()).toContain('vue-portal-target')
    expect($slot.classes().length).toBe(2)
    expect($slot.text()).toEqual('')

    return $slot
  }

  // Test for Vue 2 specific behavior
  it('renders PortalTarget component in Vue 2', async () => {
    const wrapper = mountToaster()
    const $slot = await assertBaseStructureAndAttributes(wrapper)

    expect($slot.findComponent(PortalTarget).exists()).toBe(true)

    wrapper.destroy()
  })

  // Test for Vue 3 specific behavior
  it('renders correctly without a PortalTarget component in Vue 3', async () => {
    const wrapper = mountToaster()
    await assertBaseStructureAndAttributes(wrapper)

    // In Vue 3, we expect the PortalTarget component not to be part of the implementation.
    // The base structure and attributes are what matter.

    wrapper.destroy()
  })
})