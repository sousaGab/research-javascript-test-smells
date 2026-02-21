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

    expect($carousel.emitted('sliding-start')).toBeDefined()
    expect($carousel.emitted('sliding-end')).toBeDefined()
    expect($carousel.emitted('sliding-start').length).toBe(1)
    expect($carousel.emitted('sliding-end').length).toBe(1)
    // Should have index of 0
    expect($carousel.emitted('sliding-start')[0][0]).toEqual(0)
    expect($carousel.emitted('sliding-end')[0][0]).toEqual(0)
    expect($carousel.emitted('input')).toBeDefined()
    expect($carousel.emitted('input').length).toBe(1)
    expect($carousel.emitted('input')[0][0]).toEqual(0)
    expect($carousel.vm.index).toBe(0)
    expect($carousel.vm.isSliding).toBe(false)

    // Call vm.prev()
    $carousel.vm.prev()
    await waitNT(wrapper.vm)

    expect($carousel.emitted('sliding-start').length).toBe(2)
    expect($carousel.emitted('sliding-end').length).toBe(2)
    // Should have index set to last slide
    expect($carousel.emitted('sliding-start')[1][0]).toEqual(3)
    expect($carousel.emitted('sliding-end')[1][0]).toEqual(3)
    expect($carousel.emitted('input').length).toBe(2)
    expect($carousel.emitted('input')[1][0]).toEqual(3)
    expect($carousel.vm.index).toBe(3)
    expect($carousel.vm.isSliding).toBe(false)

    wrapper.destroy()
  })

  function assertSlidingStartAndEnd(carousel, expectedIndex) {
    expect(carousel.emitted('sliding-start')).toBeDefined()
    expect(carousel.emitted('sliding-end')).toBeDefined()
    expect(carousel.emitted('sliding-start').length).toBe(1)
    expect(carousel.emitted('sliding-end').length).toBe(1)
    expect(carousel.emitted('sliding-start')[0][0]).toEqual(expectedIndex)
    expect(carousel.emitted('sliding-end')[0][0]).toEqual(expectedIndex)
  }