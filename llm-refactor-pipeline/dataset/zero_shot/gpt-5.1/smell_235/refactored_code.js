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

  const expectNoEmits = () => {
    const { slidingStart, slidingEnd, input } = getEmits()
    expect(slidingStart).toBeUndefined()
    expect(slidingEnd).toBeUndefined()
    expect(input).toBeUndefined()
  }

  const expectEmitCounts = (slidingStartCount, slidingEndCount, inputCount) => {
    const { slidingStart, slidingEnd, input } = getEmits()
    expect(slidingStart.length).toBe(slidingStartCount)
    expect(slidingEnd.length).toBe(slidingEndCount)
    expect(input.length).toBe(inputCount)
  }

  const expectLastEmitValues = (index, emitIndex) => {
    const { slidingStart, slidingEnd, input } = getEmits()
    expect(slidingStart[emitIndex][0]).toEqual(index)
    expect(slidingEnd[emitIndex][0]).toEqual(index)
    expect(input[emitIndex][0]).toEqual(index)
  }

  const expectCarouselState = (index, isSliding) => {
    expect($carousel.vm.index).toBe(index)
    expect($carousel.vm.isSliding).toBe(isSliding)
  }

  expectCarouselState(3, false)
  expectNoEmits()

  $carousel.vm.next()
  await waitNT(wrapper.vm)

  expectEmitCounts(1, 1, 1)
  expectLastEmitValues(0, 0)
  expectCarouselState(0, false)

  $carousel.vm.prev()
  await waitNT(wrapper.vm)

  expectEmitCounts(2, 2, 2)
  expectLastEmitValues(3, 1)
  expectCarouselState(3, false)

  wrapper.destroy()
})