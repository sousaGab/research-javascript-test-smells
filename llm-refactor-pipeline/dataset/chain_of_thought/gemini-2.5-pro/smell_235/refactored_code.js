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

  // Call vm.next()
  $carousel.vm.next()
  await waitNT(wrapper.vm)

  // Should have wrapped to first slide (index 0)
  expect($carousel.emitted('sliding-start')).toEqual([
    [0]
  ])
  expect($carousel.emitted('sliding-end')).toEqual([
    [0]
  ])
  expect($carousel.emitted('input')).toEqual([
    [0]
  ])
  expect($carousel.vm.index).toBe(0)
  expect($carousel.vm.isSliding).toBe(false)

  // Call vm.prev()
  $carousel.vm.prev()
  await waitNT(wrapper.vm)

  // Should have wrapped to last slide (index 3)
  expect($carousel.emitted('sliding-start')).toEqual([
    [0],
    [3]
  ])
  expect($carousel.emitted('sliding-end')).toEqual([
    [0],
    [3]
  ])
  expect($carousel.emitted('input')).toEqual([
    [0],
    [3]
  ])
  expect($carousel.vm.index).toBe(3)
  expect($carousel.vm.isSliding).toBe(false)

  wrapper.destroy()
})