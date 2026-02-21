it('focus and blur handling works', async () => {
    const wrapper = mount(BFormSpinbutton, {
      attachTo: document.body
    })
    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.classes()).toContain('b-form-spinbutton')
    expect(wrapper.classes()).toContain('form-control')
    expect(wrapper.classes()).toContain('d-flex')
    expect(wrapper.classes()).toContain('align-items-stretch')
    expect(wrapper.classes()).not.toContain('d-inline-flex')
    expect(wrapper.classes()).not.toContain('flex-column')
    expect(wrapper.classes()).not.toContain('focus')
    expect(wrapper.attributes('role')).toEqual('group')
    expect(wrapper.attributes('tabindex')).toEqual('-1')

    const $output = wrapper.find('output')
    expect($output.exists()).toBe(true)
    expect($output.attributes('role')).toEqual('spinbutton')
    expect($output.attributes('tabindex')).toEqual('0')
    expect($output.attributes('aria-live')).toEqual('off')
    expect($output.attributes('aria-valuemin')).toEqual('1')
    expect($output.attributes('aria-valuemax')).toEqual('100')
    // These two attribute should not exist on the element
    expect($output.element.hasAttribute('aria-valuenow')).toBe(false)
    expect($output.element.hasAttribute('aria-valuetext')).toBe(false)

    expect(document.activeElement).not.toBe($output.element)

    await $output.trigger('focus')
    expect(wrapper.classes()).toContain('focus')
    expect(document.activeElement).toBe($output.element)

    await $output.trigger('blur')
    expect(wrapper.classes()).not.toContain('focus')
    expect(document.activeElement).not.toBe($output.element)

    await wrapper.setProps({
      disabled: true
    })
    await waitNT(wrapper.vm)

    await $output.trigger('focus')
    expect(wrapper.classes()).not.toContain('focus')
    expect(document.activeElement).not.toBe($output.element)

    try {
      $output.element.focus()
    } catch {}
    await waitNT(wrapper.vm)
    expect(wrapper.classes()).not.toContain('focus')
    expect(document.activeElement).not.toBe($output.element)

    await $output.trigger('focus')
    expect(wrapper.classes()).not.toContain('focus')
    expect(document.activeElement).not.toBe($output.element)

    wrapper.destroy()
  })