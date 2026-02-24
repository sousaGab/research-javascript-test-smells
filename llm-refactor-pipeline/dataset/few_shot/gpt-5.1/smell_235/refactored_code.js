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

  await waitNT(wrapper.vm)
  await waitRAF()

  const $indicators = $carousel.findAll('.carousel-indicators > li')
  expect($indicators.length).toBe(4)

  const getEmits = () => ({
    slidingStart: $carousel.emitted('sliding-start'),
    slidingEnd: $carousel.emitted('sliding-end'),
    input: $carousel.emitted('input')
  })

  let emits = getEmits()

  expect(emits.slidingStart).toBeUndefined()
  expect(emits.slidingEnd).toBeUndefined()
  expect(emits.input).toBeUndefined()

  expect($carousel.vm.index).toBe(3)
  expect($carousel.vm.isSliding).toBe(false)

  // Call vm.next()
  $carousel.vm.next()
  await waitNT(wrapper.vm)

  emits = getEmits()

  expect(emits.slidingStart).toBeDefined()
  expect(emits.slidingEnd).toBeDefined()
  expect(emits.slidingStart.length).toBe(1)
  expect(emits.slidingEnd.length).toBe(1)
  expect(emits.slidingStart[0][0]).toEqual(0)
  expect(emits.slidingEnd[0][0]).toEqual(0)
  expect(emits.input).toBeDefined()
  expect(emits.input.length).toBe(1)
  expect(emits.input[0][0]).toEqual(0)
  expect($carousel.vm.index).toBe(0)
  expect($carousel.vm.isSliding).toBe(false)

  // Call vm.prev()
  $carousel.vm.prev()
  await waitNT(wrapper.vm)

  emits = getEmits()

  expect(emits.slidingStart.length).toBe(2)
  expect(emits.slidingEnd.length).toBe(2)
  expect(emits.slidingStart[1][0]).toEqual(3)
  expect(emits.slidingEnd[1][0]).toEqual(3)
  expect(emits.input.length).toBe(2)
  expect(emits.input[1][0]).toEqual(3)
  expect($carousel.vm.index).toBe(3)
  expect($carousel.vm.isSliding).toBe(false)

  wrapper.destroy()
})