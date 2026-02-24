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

  const assertSlideChange = (expectedIndex, callCount) => {
    // Consolidate event emission checks
    const events = ['sliding-start', 'sliding-end', 'input']
    events.forEach(event => {
      expect($carousel.emitted(event)).toHaveLength(callCount)
      expect($carousel.emitted(event)[callCount - 1]).toEqual([expectedIndex])
    })

    // Consolidate state checks
    expect($carousel.vm).toHaveProperty('index', expectedIndex)
    expect($carousel.vm).toHaveProperty('isSliding', false)
  }

  await waitNT(wrapper.vm)
  await waitRAF()

  // Initial state
  expect($carousel.findAll('.carousel-indicators > li')).toHaveLength(4)
  expect($carousel.emitted()).toEqual({})
  expect($carousel.vm.index).toBe(3)
  expect($carousel.vm.isSliding).toBe(false)

  // Action 1: Go to next slide (wraps from 3 to 0)
  $carousel.vm.next()
  await waitNT(wrapper.vm)

  // Assertions 1
  assertSlideChange(0, 1)

  // Action 2: Go to previous slide (wraps from 0 to 3)
  $carousel.vm.prev()
  await waitNT(wrapper.vm)

  // Assertions 2
  assertSlideChange(3, 2)

  wrapper.destroy()
})