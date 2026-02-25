describe('BToaster with aria props', () => {
  // Test for Vue 2 specific behavior
  (!isVue3 ? it : it.skip)('renders PortalTarget on Vue 2', async () => {
    const wrapper = mount(BToaster, {
      attachTo: document.body,
      propsData: {
        name: 'bar',
        ariaLive: 'assertive',
        ariaAtomic: 'true',
        role: 'alert'
      }
    })

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
    expect($slot.findComponent(PortalTarget).exists()).toBe(true)
    expect($slot.element.tagName).toBe('DIV')
    expect($slot.classes()).toContain('b-toaster-slot')
    expect($slot.classes()).toContain('vue-portal-target')
    expect($slot.classes().length).toBe(2)
    expect($slot.text()).toEqual('')

    wrapper.destroy()
  })

  // Test for Vue 3 specific behavior
  (isVue3 ? it : it.skip)('renders correctly on Vue 3', async () => {
    const wrapper = mount(BToaster, {
      attachTo: document.body,
      propsData: {
        name: 'bar',
        ariaLive: 'assertive',
        ariaAtomic: 'true',
        role: 'alert'
      }
    })

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

    wrapper.destroy()
  })
})