it('should scroll to next/prev slide when key next/prev pressed', async () => {
    const wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        interval: 0,
        controls: true
      }
    })

    expect(wrapper.vm).toBeDefined()
    const $carousel = wrapper.findComponent(BCarousel)
    expect($carousel).toBeDefined()
    expect($carousel.vm).toBeDefined()

    await waitNT(wrapper.vm)
    await waitRAF()

    expect($carousel.emitted('sliding-start')).toBeUndefined()
    expect($carousel.emitted('sliding-end')).toBeUndefined()
    expect($carousel.emitted('input')).toBeUndefined()

    await $carousel.trigger('keydown.right')

    expect($carousel.emitted('sliding-start')).toBeDefined()
    expect($carousel.emitted('sliding-end')).toBeUndefined()
    expect($carousel.emitted('sliding-start').length).toBe(1)
    expect($carousel.emitted('sliding-start')[0][0]).toEqual(1)

    jest.runOnlyPendingTimers()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect($carousel.emitted('sliding-start').length).toBe(1)
    expect($carousel.emitted('sliding-end')).toBeDefined()
    expect($carousel.emitted('sliding-end').length).toBe(1)
    expect($carousel.emitted('sliding-end')[0][0]).toEqual(1)
    expect($carousel.emitted('input')).toBeDefined()
    expect($carousel.emitted('input').length).toBe(1)
    expect($carousel.emitted('input')[0][0]).toEqual(1)

    await $carousel.trigger('keydown.left')

    expect($carousel.emitted('sliding-start').length).toBe(2)
    expect($carousel.emitted('sliding-end').length).toBe(1)
    expect($carousel.emitted('sliding-start')[1][0]).toEqual(0)

    jest.runOnlyPendingTimers()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect($carousel.emitted('sliding-start').length).toBe(2)
    expect($carousel.emitted('sliding-end').length).toBe(2)
    expect($carousel.emitted('sliding-end')[1][0]).toEqual(0)
    expect($carousel.emitted('input').length).toBe(2)
    expect($carousel.emitted('input')[1][0]).toEqual(0)

    wrapper.destroy()
  })