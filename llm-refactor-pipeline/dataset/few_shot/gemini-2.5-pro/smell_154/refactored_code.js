describe('BToaster', () => {
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

  it('has expected structure and attributes', () => {
    expect(wrapper.vm).toBeDefined()
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('id')).toBe('foo')
    expect(wrapper.attributes('aria-live')).toBeUndefined()
    expect(wrapper.attributes('aria-atomic')).toBeUndefined()
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.classes()).toContain('b-toaster')
    expect(wrapper.classes()).toContain('foo')
    expect(wrapper.classes().length).toBe(2)

    const $slot = wrapper.find('.b-toaster-slot')
    expect($slot.exists()).toBe(true)
    expect($slot.element.tagName).toBe('DIV')
    expect($slot.classes()).toContain('b-toaster-slot')
    expect($slot.classes()).toContain('vue-portal-target')
    expect($slot.classes().length).toBe(2)
    expect($slot.text()).toEqual('')
  })

  if (!isVue3) {
    it('renders PortalTarget component in Vue 2', () => {
      const $slot = wrapper.find('.b-toaster-slot')
      expect($slot.findComponent(PortalTarget).exists()).toBe(true)
    })
  }
})