describe('BToaster structure', () => {
  let wrapper

  beforeEach(async () => {
    wrapper = mount(BToaster, {
      attachTo: document.body,
      propsData: {
        name: 'foo'
      }
    })
    await waitNT(wrapper.vm)
    await waitRAF()
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('renders a root element with correct structure and attributes', () => {
    expect(wrapper.vm).toBeDefined()
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('id')).toBe('foo')
    expect(wrapper.attributes('aria-live')).toBeUndefined()
    expect(wrapper.attributes('aria-atomic')).toBeUndefined()
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.classes()).toEqual(['b-toaster', 'foo'])
  })

  it('renders a slot element with correct structure', () => {
    const $slot = wrapper.find('.b-toaster-slot')
    expect($slot.exists()).toBe(true)
    expect($slot.element.tagName).toBe('DIV')
    expect($slot.classes()).toEqual(['b-toaster-slot', 'vue-portal-target'])
    expect($slot.text()).toEqual('')
  })

  if (!isVue3) {
    it('renders a PortalTarget component for Vue 2', () => {
      const $slot = wrapper.find('.b-toaster-slot')
      expect($slot.findComponent(PortalTarget).exists()).toBe(true)
    })
  }
})