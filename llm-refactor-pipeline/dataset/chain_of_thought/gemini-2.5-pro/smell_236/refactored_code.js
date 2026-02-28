it('should scroll to next/prev slide when key next/prev pressed', async () => {
  const wrapper = mount(App, {
    attachTo: document.body,
    propsData: {
      interval: 0,
      controls: true
    }
  })

  expect(wrapper.vm).toBeDefined()
  const $carousel = wrapper.findComponent(BCarousel)
  expect($carousel.vm).toBeDefined()

  await waitNT(wrapper.vm)
  await waitRAF()

  // Initial state: no events emitted
  expect($carousel.emitted()).toEqual({})

  // Trigger next slide
  await $carousel.trigger('keydown.right')

  // Assert sliding-start event is emitted for the next slide
  expect($carousel.emitted()).toEqual({
    'sliding-start': [
      [1]
    ]
  })

  jest.runOnlyPendingTimers()
  await waitNT(wrapper.vm)
  await waitRAF()

  // Assert sliding-end and input events are emitted after transition
  expect($carousel.emitted()).toEqual({
    'sliding-start': [
      [1]
    ],
    'sliding-end': [
      [1]
    ],
    input: [
      [1]
    ]
  })

  // Trigger previous slide
  await $carousel.trigger('keydown.left')

  // Assert sliding-start event is emitted for the previous slide
  expect($carousel.emitted()).toEqual({
    'sliding-start': [
      [1],
      [0]
    ],
    'sliding-end': [
      [1]
    ],
    input: [
      [1]
    ]
  })

  jest.runOnlyPendingTimers()
  await waitNT(wrapper.vm)
  await waitRAF()

  // Assert sliding-end and input events are emitted after transition
  expect($carousel.emitted()).toEqual({
    'sliding-start': [
      [1],
      [0]
    ],
    'sliding-end': [
      [1],
      [0]
    ],
    input: [
      [1],
      [0]
    ]
  })

  wrapper.destroy()
})