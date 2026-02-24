it('next/prev slide wraps to end/start when "no-wrap is "false"', async () => {
  const wrapper = mount(App, {
    attachTo: document.body,
    propsData: {
      interval: 0,
      noAnimation: true,
      noWrap: false,
      value: 3
    }
  })

  const $carousel = wrapper.findComponent(BCarousel)
  expect($carousel.exists()).toBe(true)

  await waitNT(wrapper.vm)
  await waitRAF()

  expect($carousel.findAll('.carousel-indicators > li').length).toBe(4)

  // Initial state
  expect($carousel.emitted()).toEqual({})
  expect($carousel.vm.index).toBe(3)
  expect($carousel.vm.isSliding).toBe(false)

  // Go to next slide (wraps from last to first)
  $carousel.vm.next()
  await waitNT(wrapper.vm)

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

  // Go to previous slide (wraps from first to last)
  $carousel.vm.prev()
  await waitNT(wrapper.vm)

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