// Your COMPLETE refactored test code here
describe('BToaster', () => {
  const runStructureAssertions = async () => {
    const wrapper = mount(BToaster, {
      attachTo: document.body,
      propsData: {
        name: 'foo'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('id')).toBe('foo')
    expect(wrapper.attributes('aria-live')).toBeUndefined()
    expect(wrapper.attributes('aria-atomic')).toBeUndefined()
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.classes()).toContain('b-toaster')
    expect(wrapper.classes()).toContain('foo')
    expect(wrapper.classes().length).toBe(2)

    expect(wrapper.find('.b-toaster-slot').exists()).toBe(true)
    const $slot = wrapper.find('.b-toaster-slot')

    expect($slot.element.tagName).toBe('DIV')
    expect($slot.classes()).toContain('b-toaster-slot')
    expect($slot.classes()).toContain('vue-portal-target')
    expect($slot.classes().length).toBe(2)
    expect($slot.text()).toEqual('')

    wrapper.destroy()
  }

  const runStructureAssertionsWithPortalTarget = async () => {
    const wrapper = mount(BToaster, {
      attachTo: document.body,
      propsData: {
        name: 'foo'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('id')).toBe('foo')
    expect(wrapper.attributes('aria-live')).toBeUndefined()
    expect(wrapper.attributes('aria-atomic')).toBeUndefined()
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.classes()).toContain('b-toaster')
    expect(wrapper.classes()).toContain('foo')
    expect(wrapper.classes().length).toBe(2)

    expect(wrapper.find('.b-toaster-slot').exists()).toBe(true)
    const $slot = wrapper.find('.b-toaster-slot')

    expect($slot.findComponent(PortalTarget).exists()).toBe(true)

    expect($slot.element.tagName).toBe('DIV')
    expect($slot.classes()).toContain('b-toaster-slot')
    expect($slot.classes()).toContain('vue-portal-target')
    expect($slot.classes().length).toBe(2)
    expect($slot.text()).toEqual('')

    wrapper.destroy()
  }

  ;(isVue3 ? it : it.skip)('has expected structure', runStructureAssertions)
  ;(!isVue3 ? it : it.skip)(
    'has expected structure (includes PortalTarget on Vue 2)',
    runStructureAssertionsWithPortalTarget
  )
})