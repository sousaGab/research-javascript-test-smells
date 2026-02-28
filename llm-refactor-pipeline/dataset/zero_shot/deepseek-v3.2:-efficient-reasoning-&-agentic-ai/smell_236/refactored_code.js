it('should scroll to next/prev slide when key next/prev pressed', async () => {
  const wrapper = mount(App, {
    attachTo: document.body,
    propsData: {
      interval: 0,
      controls: true
    }
  })

  const $carousel = wrapper.findComponent(BCarousel)

  await waitNT(wrapper.vm)
  await waitRAF()

  expect($carousel.emitted()).toEqual({})

  await $carousel.trigger('keydown.right')

  expect($carousel.emitted('sliding-start')).toEqual([[1]])
  expect($carousel.emitted('sliding-end')).toBeUndefined()
  expect($carousel.emitted('input')).toBeUndefined()

  jest.runOnlyPendingTimers()
  await waitNT(wrapper.vm)
  await waitRAF()

  expect($carousel.emitted('sliding-start')).toEqual([[1]])
  expect($carousel.emitted('sliding-end')).toEqual([[1]])
  expect($carousel.emitted('input')).toEqual([[1]])

  await $carousel.trigger('keydown.left')

  expect($carousel.emitted('sliding-start')).toEqual([[1], [0]])
  expect($carousel.emitted('sliding-end')).toEqual([[1]])

  jest.runOnlyPendingTimers()
  await waitNT(wrapper.vm)
  await waitRAF()

  expect($carousel.emitted('sliding-start')).toEqual([[1], [0]])
  expect($carousel.emitted('sliding-end')).toEqual([[1], [0]])
  expect($carousel.emitted('input')).toEqual([[1], [0]])

  wrapper.destroy()
})