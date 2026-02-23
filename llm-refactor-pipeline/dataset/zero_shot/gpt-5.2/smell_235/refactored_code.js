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

  const getCarousel = () => wrapper.findComponent(BCarousel)
  const emitted = (name) => getCarousel().emitted(name)
  const emittedCount = (name) => (emitted(name) ? emitted(name).length : 0)
  const emittedFirstArgAt = (name, idx) => emitted(name)[idx][0]

  const expectNoEmits = (...names) => {
    names.forEach((n) => expect(emitted(n)).toBeUndefined())
  }

  const expectEmitsAt = (name, idx, value) => {
    expect(emitted(name)).toBeDefined()
    expect(emittedCount(name)).toBeGreaterThan(idx)
    expect(emittedFirstArgAt(name, idx)).toEqual(value)
  }

  const expectCarouselState = (index, isSliding = false) => {
    const $carousel = getCarousel()
    expect($carousel.vm.index).toBe(index)
    expect($carousel.vm.isSliding).toBe(isSliding)
  }

  expect(wrapper.vm).toBeDefined()

  const $carousel = getCarousel()
  expect($carousel).toBeDefined()
  expect($carousel.vm).toBeDefined()

  await waitNT(wrapper.vm)
  await waitRAF()

  const $indicators = $carousel.findAll('.carousel-indicators > li')
  expect($indicators.length).toBe(4)

  expectNoEmits('sliding-start', 'sliding-end', 'input')
  expectCarouselState(3, false)

  // Transitions (or fallback timers) are not used when no-animation set
  // Call vm.next()
  $carousel.vm.next()
  await waitNT(wrapper.vm)

  expectEmitsAt('sliding-start', 0, 0)
  expectEmitsAt('sliding-end', 0, 0)
  expectEmitsAt('input', 0, 0)
  expect(emittedCount('sliding-start')).toBe(1)
  expect(emittedCount('sliding-end')).toBe(1)
  expect(emittedCount('input')).toBe(1)
  expectCarouselState(0, false)

  // Call vm.prev()
  $carousel.vm.prev()
  await waitNT(wrapper.vm)

  expectEmitsAt('sliding-start', 1, 3)
  expectEmitsAt('sliding-end', 1, 3)
  expectEmitsAt('input', 1, 3)
  expect(emittedCount('sliding-start')).toBe(2)
  expect(emittedCount('sliding-end')).toBe(2)
  expect(emittedCount('input')).toBe(2)
  expectCarouselState(3, false)

  wrapper.destroy()
})