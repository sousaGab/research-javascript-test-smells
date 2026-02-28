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

  const getEmitted = (name) => $carousel.emitted(name)
  const expectNotEmitted = (name) => expect(getEmitted(name)).toBeUndefined()
  const expectEmittedCount = (name, count) => expect(getEmitted(name).length).toBe(count)
  const expectEmittedIndex = (name, callIndex, expectedIndex) =>
    expect(getEmitted(name)[callIndex][0]).toEqual(expectedIndex)

  const expectCarouselState = ({ index, isSliding }) => {
    expect($carousel.vm.index).toBe(index)
    expect($carousel.vm.isSliding).toBe(isSliding)
  }

  const expectSlideEmitsAt = (callIndex, expectedIndex) => {
    expectEmittedIndex('sliding-start', callIndex, expectedIndex)
    expectEmittedIndex('sliding-end', callIndex, expectedIndex)
    expectEmittedIndex('input', callIndex, expectedIndex)
  }

  expect(wrapper.vm).toBeDefined()
  const $carousel = wrapper.findComponent(BCarousel)
  expect($carousel).toBeDefined()
  expect($carousel.vm).toBeDefined()

  await waitNT(wrapper.vm)
  await waitRAF()

  const $indicators = $carousel.findAll('.carousel-indicators > li')
  expect($indicators.length).toBe(4)

  expectNotEmitted('sliding-start')
  expectNotEmitted('sliding-end')
  expectNotEmitted('input')

  expectCarouselState({ index: 3, isSliding: false })

  // Transitions (or fallback timers) are not used when no-animation set
  // Call vm.next()
  $carousel.vm.next()
  await waitNT(wrapper.vm)

  expect(getEmitted('sliding-start')).toBeDefined()
  expect(getEmitted('sliding-end')).toBeDefined()
  expectEmittedCount('sliding-start', 1)
  expectEmittedCount('sliding-end', 1)
  expect(getEmitted('input')).toBeDefined()
  expectEmittedCount('input', 1)

  // Should have index of 0
  expectSlideEmitsAt(0, 0)
  expectCarouselState({ index: 0, isSliding: false })

  // Call vm.prev()
  $carousel.vm.prev()
  await waitNT(wrapper.vm)

  expectEmittedCount('sliding-start', 2)
  expectEmittedCount('sliding-end', 2)
  expectEmittedCount('input', 2)

  // Should have index set to last slide
  expectSlideEmitsAt(1, 3)
  expectCarouselState({ index: 3, isSliding: false })

  wrapper.destroy()
})