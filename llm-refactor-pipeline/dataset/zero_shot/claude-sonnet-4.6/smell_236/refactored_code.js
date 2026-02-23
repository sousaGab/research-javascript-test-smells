it('should scroll to next/prev slide when key next/prev pressed', async () => {
    const wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        interval: 0,
        controls: true
      }
    })

    const $carousel = wrapper.findComponent(BCarousel)

    await waitNT(wrapper.vm)
    await waitRAF()

    expect($carousel.emitted('sliding-start')).toBeUndefined()
    expect($carousel.emitted('sliding-end')).toBeUndefined()
    expect($carousel.emitted('input')).toBeUndefined()

    await $carousel.trigger('keydown.right')

    const slidingStart = $carousel.emitted('sliding-start')
    expect(slidingStart).toBeDefined()
    expect($carousel.emitted('sliding-end')).toBeUndefined()
    expect(slidingStart.length).toBe(1)
    expect(slidingStart[0][0]).toEqual(1)

    jest.runOnlyPendingTimers()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect($carousel.emitted('sliding-start').length).toBe(1)

    const slidingEnd = $carousel.emitted('sliding-end')
    expect(slidingEnd).toBeDefined()
    expect(slidingEnd.length).toBe(1)
    expect(slidingEnd[0][0]).toEqual(1)

    const input = $carousel.emitted('input')
    expect(input).toBeDefined()
    expect(input.length).toBe(1)
    expect(input[0][0]).toEqual(1)

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