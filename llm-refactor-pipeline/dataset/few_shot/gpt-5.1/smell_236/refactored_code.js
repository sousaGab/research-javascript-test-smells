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
    slidingStart: $carousel.emitted('sliding-start'),
    slidingEnd: $carousel.emitted('sliding-end'),
    input: $carousel.emitted('input')
  })

  const expectEmitState = ({
    slidingStartLength,
    slidingEndLength,
    inputLength,
    slidingStartIndexValue,
    slidingEndIndexValue,
    inputIndexValue
  }) => {
    const { slidingStart, slidingEnd, input } = getEmits()

    if (slidingStartLength === 0) {
      expect(slidingStart).toBeUndefined()
    } else if (typeof slidingStartLength === 'number') {
      expect(slidingStart).toBeDefined()
      expect(slidingStart.length).toBe(slidingStartLength)
    }

    if (slidingEndLength === 0) {
      expect(slidingEnd).toBeUndefined()
    } else if (typeof slidingEndLength === 'number') {
      expect(slidingEnd).toBeDefined()
      expect(slidingEnd.length).toBe(slidingEndLength)
    }

    if (inputLength === 0) {
      expect(input).toBeUndefined()
    } else if (typeof inputLength === 'number') {
      expect(input).toBeDefined()
      expect(input.length).toBe(inputLength)
    }

    if (slidingStartIndexValue !== undefined) {
      const { index, value } = slidingStartIndexValue
      expect(slidingStart[index][0]).toEqual(value)
    }

    if (slidingEndIndexValue !== undefined) {
      const { index, value } = slidingEndIndexValue
      expect(slidingEnd[index][0]).toEqual(value)
    }

    if (inputIndexValue !== undefined) {
      const { index, value } = inputIndexValue
      expect(input[index][0]).toEqual(value)
    }
  }

  await waitNT(wrapper.vm)
  await waitRAF()

  expectEmitState({
    slidingStartLength: 0,
    slidingEndLength: 0,
    inputLength: 0
  })

  await $carousel.trigger('keydown.right')

  expectEmitState({
    slidingStartLength: 1,
    slidingEndLength: 0,
    inputLength: 0,
    slidingStartIndexValue: { index: 0, value: 1 }
  })

  jest.runOnlyPendingTimers()
  await waitNT(wrapper.vm)
  await waitRAF()

  expectEmitState({
    slidingStartLength: 1,
    slidingEndLength: 1,
    inputLength: 1,
    slidingEndIndexValue: { index: 0, value: 1 },
    inputIndexValue: { index: 0, value: 1 }
  })

  await $carousel.trigger('keydown.left')

  expectEmitState({
    slidingStartLength: 2,
    slidingEndLength: 1,
    inputLength: 1,
    slidingStartIndexValue: { index: 1, value: 0 }
  })

  jest.runOnlyPendingTimers()
  await waitNT(wrapper.vm)
  await waitRAF()

  expectEmitState({
    slidingStartLength: 2,
    slidingEndLength: 2,
    inputLength: 2,
    slidingEndIndexValue: { index: 1, value: 0 },
    inputIndexValue: { index: 1, value: 0 }
  })

  wrapper.destroy()
})