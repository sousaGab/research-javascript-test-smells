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
    expect($carousel.vm).toBeDefined()

    await waitNT(wrapper.vm)
    await waitRAF()

    expect($carousel.emitted('sliding-start')).toBeUndefined()
    expect($carousel.emitted('sliding-end')).toBeUndefined()
    expect($carousel.emitted('input')).toBeUndefined()

    await $carousel.trigger('keydown.right')

    const slidingStartAfterRight = $carousel.emitted('sliding-start')
    expect(slidingStartAfterRight).toBeDefined()
    expect($carousel.emitted('sliding-end')).toBeUndefined()
    expect(slidingStartAfterRight.length).toBe(1)
    expect(slidingStartAfterRight[0][0]).toEqual(1)

    jest.runOnlyPendingTimers()
    await waitNT(wrapper.vm)
    await waitRAF()

    const slidingEndAfterRight = $carousel.emitted('sliding-end')
    const inputAfterRight = $carousel.emitted('input')
    expect($carousel.emitted('sliding-start').length).toBe(1)
    expect(slidingEndAfterRight).toBeDefined()
    expect(slidingEndAfterRight.length).toBe(1)
    expect(slidingEndAfterRight[0][0]).toEqual(1)
    expect(inputAfterRight).toBeDefined()
    expect(inputAfterRight.length).toBe(1)
    expect(inputAfterRight[0][0]).toEqual(1)

    await $carousel.trigger('keydown.left')

    const slidingStartAfterLeft = $carousel.emitted('sliding-start')
    expect(slidingStartAfterLeft.length).toBe(2)
    expect($carousel.emitted('sliding-end').length).toBe(1)
    expect(slidingStartAfterLeft[1][0]).toEqual(0)

    jest.runOnlyPendingTimers()
    await waitNT(wrapper.vm)
    await waitRAF()

    const slidingEndAfterLeft = $carousel.emitted('sliding-end')
    const inputAfterLeft = $carousel.emitted('input')
    expect($carousel.emitted('sliding-start').length).toBe(2)
    expect(slidingEndAfterLeft.length).toBe(2)
    expect(slidingEndAfterLeft[1][0]).toEqual(0)
    expect(inputAfterLeft.length).toBe(2)
    expect(inputAfterLeft[1][0]).toEqual(0)

    wrapper.destroy()
  })