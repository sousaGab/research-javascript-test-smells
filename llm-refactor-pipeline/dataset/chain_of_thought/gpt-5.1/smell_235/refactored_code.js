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

  const getEmits = (carousel, event) => carousel.emitted(event)
  const getFirstPayload = (emits, index = 0) => emits[index][0]

  const $carousel = wrapper.findComponent(BCarousel)

  await waitNT(wrapper.vm)
  await waitRAF()

  const $indicators = $carousel.findAll('.carousel-indicators > li')
  expect($indicators.length).toBe(4)

  expect(getEmits($carousel, 'sliding-start')).toBeUndefined()
  expect(getEmits($carousel, 'sliding-end')).toBeUndefined()
  expect(getEmits($carousel, 'input')).toBeUndefined()

  expect($carousel.vm.index).toBe(3)
  expect($carousel.vm.isSliding).toBe(false)

  $carousel.vm.next()
  await waitNT(wrapper.vm)

  const slidingStartEmitsAfterNext = getEmits($carousel, 'sliding-start')
  const slidingEndEmitsAfterNext = getEmits($carousel, 'sliding-end')
  const inputEmitsAfterNext = getEmits($carousel, 'input')

  expect(slidingStartEmitsAfterNext).toBeDefined()
  expect(slidingEndEmitsAfterNext).toBeDefined()
  expect(slidingStartEmitsAfterNext.length).toBe(1)
  expect(slidingEndEmitsAfterNext.length).toBe(1)
  expect(getFirstPayload(slidingStartEmitsAfterNext)).toEqual(0)
  expect(getFirstPayload(slidingEndEmitsAfterNext)).toEqual(0)
  expect(inputEmitsAfterNext).toBeDefined()
  expect(inputEmitsAfterNext.length).toBe(1)
  expect(getFirstPayload(inputEmitsAfterNext)).toEqual(0)
  expect($carousel.vm.index).toBe(0)
  expect($carousel.vm.isSliding).toBe(false)

  $carousel.vm.prev()
  await waitNT(wrapper.vm)

  const slidingStartEmitsAfterPrev = getEmits($carousel, 'sliding-start')
  const slidingEndEmitsAfterPrev = getEmits($carousel, 'sliding-end')
  const inputEmitsAfterPrev = getEmits($carousel, 'input')

  expect(slidingStartEmitsAfterPrev.length).toBe(2)
  expect(slidingEndEmitsAfterPrev.length).toBe(2)
  expect(getFirstPayload(slidingStartEmitsAfterPrev, 1)).toEqual(3)
  expect(getFirstPayload(slidingEndEmitsAfterPrev, 1)).toEqual(3)
  expect(inputEmitsAfterPrev.length).toBe(2)
  expect(getFirstPayload(inputEmitsAfterPrev, 1)).toEqual(3)
  expect($carousel.vm.index).toBe(3)
  expect($carousel.vm.isSliding).toBe(false)

  wrapper.destroy()
})