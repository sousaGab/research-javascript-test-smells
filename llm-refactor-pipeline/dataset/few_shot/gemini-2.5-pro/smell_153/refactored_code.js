describe('BToaster with aria props', () => {
  let wrapper

  beforeEach(async () => {
    wrapper = mount(BToaster, {
      attachTo: document.body,
      propsData: {
        name: 'bar',
        ariaLive: 'assertive',
        ariaAtomic: 'true',
        role: 'alert'
      }
    })
    await waitNT(wrapper.vm)
    await waitRAF()
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders correctly with specified attributes and slot structure', () => {
    expect(wrapper.vm).toBeDefined()
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
  })

  if (!isVue3) {
    it('renders a PortalTarget component in Vue 2', () => {
      const $slot = wrapper.find('.b-toaster-slot')
      expect($slot.findComponent(PortalTarget).exists()).toBe(true)
    })
  }
})