it('should scroll to next/prev slide when key next/prev pressed', async () => {
  const wrapper = mount(App, {
    attachTo: document.body,
    propsData: {
      interval: 0,
      controls: true
    }
  })

  const $carousel = wrapper.findComponent(BCarousel)

  const getEmits = () => ({
    slidingStart: $carousel.emitted('sliding-start') || [],
    slidingEnd: $carousel.emitted('sliding-end') || [],
    input: $carousel.emitted('input') || []
  })

  const expectEmitsState = ({
    slidingStartCount,
    slidingEndCount,
    inputCount,
    slidingStartLastValue,
    slidingEndLastValue,
    inputLastValue
  }) => {
    const { slidingStart, slidingEnd, input } = getEmits()

    if (slidingStartCount === 0) {
      expect(slidingStart.length).toBe(0)
    } else {
      expect(slidingStart.length).toBe(slidingStartCount)
      if (slidingStartLastValue !== undefined) {
        expect(slidingStart[slidingStart.length - 1][0]).toEqual(slidingStartLastValue)
      }
    }

    if (slidingEndCount === 0) {
      expect(slidingEnd.length).toBe(0)
    } else {
      expect(slidingEnd.length).toBe(slidingEndCount)
      if (slidingEndLastValue !== undefined) {
        expect(slidingEnd[slidingEnd.length - 1][0]).toEqual(slidingEndLastValue)
      }
    }

    if (inputCount === 0) {
      expect(input.length).toBe(0)
    } else {
      expect(input.length).toBe(inputCount)
      if (inputLastValue !== undefined) {
        expect(input[input.length - 1][0]).toEqual(inputLastValue)
      }
    }
  }

  await waitNT(wrapper.vm)
  await waitRAF()

  expectEmitsState({
    slidingStartCount: 0,
    slidingEndCount: 0,
    inputCount: 0
  })

  await $carousel.trigger('keydown.right')

  expectEmitsState({
    slidingStartCount: 1,
    slidingEndCount: 0,
    inputCount: 0,
    slidingStartLastValue: 1
  })

  jest.runOnlyPendingTimers()
  await waitNT(wrapper.vm)
  await waitRAF()

  expectEmitsState({
    slidingStartCount: 1,
    slidingEndCount: 1,
    inputCount: 1,
    slidingEndLastValue: 1,
    inputLastValue: 1
  })

  await $carousel.trigger('keydown.left')

  expectEmitsState({
    slidingStartCount: 2,
    slidingEndCount: 1,
    inputCount: 1,
    slidingStartLastValue: 0
  })

  jest.runOnlyPendingTimers()
  await waitNT(wrapper.vm)
  await waitRAF()

  expectEmitsState({
    slidingStartCount: 2,
    slidingEndCount: 2,
    inputCount: 2,
    slidingEndLastValue: 0,
    inputLastValue: 0
  })

  wrapper.destroy()
})