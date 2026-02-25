it('should scroll to next/prev slide when key next/prev pressed', async () => {
  const wrapper = mount(App, {
    attachTo: document.body,
    propsData: {
      interval: 0,
      controls: true
    }
  })

  const $carousel = wrapper.findComponent(BCarousel)
  expect($carousel.exists()).toBe(true)

  await waitNT(wrapper.vm)
  await waitRAF()

  // Initial state: no events emitted
  expect($carousel.emitted('sliding-start')).toBeUndefined()
  expect($carousel.emitted('sliding-end')).toBeUndefined()
  expect($carousel.emitted('input')).toBeUndefined()

  // --- Go to next slide (right arrow) ---
  await $carousel.trigger('keydown.right')

  // Assert slide starts moving to index 1
  expect($carousel.emitted('sliding-start')).toEqual([
    [1]
  ])
  expect($carousel.emitted('sliding-end')).toBeUndefined()

  // Wait for transition to finish
  jest.runOnlyPendingTimers()
  await waitNT(wrapper.vm)
  await waitRAF()

  // Assert slide has finished moving to index 1
  expect($carousel.emitted('sliding-end')).toEqual([
    [1]
  ])
  expect($carousel.emitted('input')).toEqual([
    [1]
  ])
  expect($carousel.emitted('sliding-start')).toHaveLength(1)

  // --- Go to previous slide (left arrow) ---
  await $carousel.trigger('keydown.left')

  // Assert slide starts moving back to index 0
  expect($carousel.emitted('sliding-start')).toEqual([
    [1],
    [0]
  ])
  expect($carousel.emitted('sliding-end')).toHaveLength(1)

  // Wait for transition to finish
  jest.runOnlyPendingTimers()
  await waitNT(wrapper.vm)
  await waitRAF()

  // Assert slide has finished moving back to index 0
  expect($carousel.emitted('sliding-end')).toEqual([
    [1],
    [0]
  ])
  expect($carousel.emitted('input')).toEqual([
    [1],
    [0]
  ])
  expect($carousel.emitted('sliding-start')).toHaveLength(2)

  wrapper.destroy()
})