it('next/prev slide wraps to end/start when "no-wrap is "false"', async () => {
    const wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        interval: 0,
        noAnimation: true,
        noWrap: false,
        // Start at last slide
        value: 3
      }
    })

    expect(wrapper.vm).toBeDefined()
    const $carousel = wrapper.findComponent(BCarousel)
    expect($carousel).toBeDefined()
    expect($carousel.vm).toBeDefined()

    await waitNT(wrapper.vm)
    await waitRAF()

    const $indicators = $carousel.findAll('.carousel-indicators > li')
    expect($indicators.length).toBe(4)

    expect($carousel.emitted('sliding-start')).toBeUndefined()
    expect($carousel.emitted('sliding-end')).toBeUndefined()
    expect($carousel.emitted('input')).toBeUndefined()

    expect($carousel.vm.index).toBe(3)
    expect($carousel.vm.isSliding).toBe(false)

    // Transitions (or fallback timers) are not used when no-animation set
    // Call vm.next()
    $carousel.vm.next()
    await waitNT(wrapper.vm)

    const slidingStart = $carousel.emitted('sliding-start')
    const slidingEnd = $carousel.emitted('sliding-end')
    const input = $carousel.emitted('input')

    expect(slidingStart).toBeDefined()
    expect(slidingEnd).toBeDefined()
    expect(slidingStart.length).toBe(1)
    expect(slidingEnd.length).toBe(1)
    // Should have index of 0
    expect(slidingStart[0][0]).toEqual(0)
    expect(slidingEnd[0][0]).toEqual(0)
    expect(input).toBeDefined()
    expect(input.length).toBe(1)
    expect(input[0][0]).toEqual(0)
    expect($carousel.vm.index).toBe(0)
    expect($carousel.vm.isSliding).toBe(false)

    // Call vm.prev()
    $carousel.vm.prev()
    await waitNT(wrapper.vm)

    const slidingStart2 = $carousel.emitted('sliding-start')
    const slidingEnd2 = $carousel.emitted('sliding-end')
    const input2 = $carousel.emitted('input')

    expect(slidingStart2.length).toBe(2)
    expect(slidingEnd2.length).toBe(2)
    // Should have index set to last slide
    expect(slidingStart2[1][0]).toEqual(3)
    expect(slidingEnd2[1][0]).toEqual(3)
    expect(input2.length).toBe(2)
    expect(input2[1][0]).toEqual(3)
    expect($carousel.vm.index).toBe(3)
    expect($carousel.vm.isSliding).toBe(false)

    wrapper.destroy()
  })