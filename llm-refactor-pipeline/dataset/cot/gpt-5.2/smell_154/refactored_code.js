describe('has expected structure', () => {
  const runCommonAssertions = async (wrapper) => {
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
  }

  const runVue2OnlyAssertions = (wrapper) => {
    const $slot = wrapper.find('.b-toaster-slot')
    expect($slot.findComponent(PortalTarget).exists()).toBe(true)
  }

  const runVue3OnlyAssertions = () => {
    // No Vue 3 specific assertions for this test case
  }

  const runFrameworkSpecificAssertions = (wrapper) => {
    const runners = {
      vue2: runVue2OnlyAssertions,
      vue3: runVue3OnlyAssertions
    }
    return (isVue3 ? runners.vue3 : runners.vue2)(wrapper)
  }

  it('has expected structure', async () => {
    const wrapper = mount(BToaster, {
      attachTo: document.body,
      propsData: {
        name: 'foo'
      }
    })

    await runCommonAssertions(wrapper)
    runFrameworkSpecificAssertions(wrapper)

    wrapper.destroy()
  })
})