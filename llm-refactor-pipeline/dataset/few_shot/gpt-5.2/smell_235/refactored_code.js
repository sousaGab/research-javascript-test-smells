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

  const $carousel = wrapper.findComponent(BCarousel)

  const expectEmittedUndefined = (name) => {
    expect($carousel.emitted(name)).toBeUndefined()
  }

  const expectEmitted = (name, count, index, value) => {
    const events = $carousel.emitted(name)
    expect(events).toBeDefined()
    expect(events.length).toBe(count)
    expect(events[index][0]).toEqual(value)
  }

  const expectCarouselState = (index, isSliding) => {
    expect($carousel.vm.index).toBe(index)
    expect($carousel.vm.isSliding).toBe(isSliding)
  }

  expect(wrapper.vm).toBeDefined()
  expect($carousel).toBeDefined()
  expect($carousel.vm).toBeDefined()

  await waitNT(wrapper.vm)
  await waitRAF()

  const $indicators = $carousel.findAll('.carousel-indicators > li')
  expect($indicators.length).toBe(4)

  expectEmittedUndefined('sliding-start')
  expectEmittedUndefined('sliding-end')
  expectEmittedUndefined('input')

  expectCarouselState(3, false)

  // Transitions (or fallback timers) are not used when no-animation set
  // Call vm.next()
  $carousel.vm.next()
  await waitNT(wrapper.vm)

  expectEmitted('sliding-start', 1, 0, 0)
  expectEmitted('sliding-end', 1, 0, 0)
  expectEmitted('input', 1, 0, 0)
  expectCarouselState(0, false)

  // Call vm.prev()
  $carousel.vm.prev()
  await waitNT(wrapper.vm)

  expectEmitted('sliding-start', 2, 1, 3)
  expectEmitted('sliding-end', 2, 1, 3)
  expectEmitted('input', 2, 1, 3)
  expectCarouselState(3, false)

  wrapper.destroy()
})