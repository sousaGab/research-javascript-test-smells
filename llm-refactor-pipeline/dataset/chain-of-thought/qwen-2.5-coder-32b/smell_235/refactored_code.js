it('next/prev slide wraps to end/start when "no-wrap" is "false"', async () => {
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

  await waitNT(wrapper.vm)
  await waitRAF()

  expect($carousel.findAll('.carousel-indicators > li')).toHaveLength(4)

  expect($carousel.emitted('sliding-start')).toBeUndefined()
  expect($carousel.emitted('sliding-end')).toBeUndefined()
  expect($carousel.emitted('input')).toBeUndefined()

  expect($carousel.vm.index).toBe(3)
  expect($carousel.vm.isSliding).toBe(false)

  // Test next() wraps to start
  $carousel.vm.next()
  await waitNT(wrapper.vm)

  expect($carousel.emitted('sliding-start')).toBeDefined()
  expect($carousel.emitted('sliding-end')).toBeDefined()
  expect($carousel.emitted('sliding-start')).toHaveLength(1)
  expect($carousel.emitted('sliding-end')).toHaveLength(1)
  expect($carousel.emitted('sliding-start')[0][0]).toEqual(0)
  expect($carousel.emitted('sliding-end')[0][0]).toEqual(0)
  expect($carousel.emitted('input')).toBeDefined()
  expect($carousel.emitted('input')).toHaveLength(1)
  expect($carousel.emitted('input')[0][0]).toEqual(0)
  expect($carousel.vm.index).toBe(0)
  expect($carousel.vm.isSliding).toBe(false)

  // Test prev() wraps to end
  $carousel.vm.prev()
  await waitNT(wrapper.vm)

  expect($carousel.emitted('sliding-start')).toHaveLength(2)
  expect($carousel.emitted('sliding-end')).toHaveLength(2)
  expect($carousel.emitted('sliding-start')[1][0]).toEqual(3)
  expect($carousel.emitted('sliding-end')[1][0]).toEqual(3)
  expect($carousel.emitted('input')).toHaveLength(2)
  expect($carousel.emitted('input')[1][0]).toEqual(3)
  expect($carousel.vm.index).toBe(3)
  expect($carousel.vm.isSliding).toBe(false)

  wrapper.destroy()
})