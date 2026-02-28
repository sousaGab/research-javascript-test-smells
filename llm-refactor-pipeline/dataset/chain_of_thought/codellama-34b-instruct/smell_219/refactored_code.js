// Your COMPLETE refactored test code here

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

    // It appears that vue-test-utils does not run unbind when the directive is
    // removed from the element. Only when the component is destroyed... unlike Vue
    // Our directive instance should not exist
    // let observer = wrapper.element.__bv__visibility_observer
    // expect(observer).toBeUndefined()

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
    // observer = wrapper.element.__bv__visibility_observer
    // expect(observer).toBeUndefined()

    await wrapper.setProps({
      show: false
    })
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.attributes('src')).toContain(src)

    // Our directive instance should not exist
    // observer = wrapper.element.__bv__visibility_observer
    // expect(observer).toBeUndefined()

    wrapper.destroy()
  })