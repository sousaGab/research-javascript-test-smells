it('shows when IntersectionObserver not supported', async () => {
    const wrapper = mount(BImgLazy, {
      attachTo: document.body,
      propsData: {
        src,
        show: false
      }
    })

    expect(wrapper.element.tagName).toBe('IMG')

    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.vm.isShown).toBe(true)

    // Our directive instance should not exist
    expect(wrapper.element.__bv__visibility_observer).toBeUndefined()

    expect(wrapper.attributes('src')).toBeDefined()
    expect(wrapper.attributes('src')).toContain(src)

    await wrapper.setProps({
      show: true
    })
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.attributes('src')).toBe(src)
    expect(wrapper.vm.isShown).toBe(true)

    // Our directive instance should not exist
    expect(wrapper.element.__bv__visibility_observer).toBeUndefined()

    await wrapper.setProps({
      show: false
    })
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.attributes('src')).toContain(src)

    // Our directive instance should not exist
    expect(wrapper.element.__bv__visibility_observer).toBeUndefined()

    wrapper.destroy()
  })