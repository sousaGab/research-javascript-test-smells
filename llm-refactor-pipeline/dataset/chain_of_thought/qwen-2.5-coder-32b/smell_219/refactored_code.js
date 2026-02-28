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

    await wrapper.setProps({
      show: false
    })
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.attributes('src')).toContain(src)

    wrapper.destroy()
  })