it('should scroll to next/prev slide when key next/prev pressed', async () => {
  const wrapper = mount(App, {
    attachTo: document.body,
    propsData: {
      interval: 0,
      controls: true
    }
  })

  const $carousel = wrapper.findComponent(BCarousel)

  const emitted = (name) => $carousel.emitted(name)
  const expectNotEmitted = (name) => expect(emitted(name)).toBeUndefined()
  const expectEmittedCount = (name, count) => expect(emitted(name).length).toBe(count)
  const expectEmittedPayloadAt = (name, index, payload) => expect(emitted(name)[index][0]).toEqual(payload)

  const flushCarousel = async () => {
    jest.runOnlyPendingTimers()
    await waitNT(wrapper.vm)
    await waitRAF()
  }

  expect(wrapper.vm).toBeDefined()
  expect($carousel).toBeDefined()
  expect($carousel.vm).toBeDefined()

  await waitNT(wrapper.vm)
  await waitRAF()

  expectNotEmitted('sliding-start')
  expectNotEmitted('sliding-end')
  expectNotEmitted('input')

  await $carousel.trigger('keydown.right')

  expect(emitted('sliding-start')).toBeDefined()
  expectNotEmitted('sliding-end')
  expectEmittedCount('sliding-start', 1)
  expectEmittedPayloadAt('sliding-start', 0, 1)

  await flushCarousel()

  expectEmittedCount('sliding-start', 1)
  expect(emitted('sliding-end')).toBeDefined()
  expectEmittedCount('sliding-end', 1)
  expectEmittedPayloadAt('sliding-end', 0, 1)
  expect(emitted('input')).toBeDefined()
  expectEmittedCount('input', 1)
  expectEmittedPayloadAt('input', 0, 1)

  await $carousel.trigger('keydown.left')

  expectEmittedCount('sliding-start', 2)
  expectEmittedCount('sliding-end', 1)
  expectEmittedPayloadAt('sliding-start', 1, 0)

  await flushCarousel()

  expectEmittedCount('sliding-start', 2)
  expectEmittedCount('sliding-end', 2)
  expectEmittedPayloadAt('sliding-end', 1, 0)
  expectEmittedCount('input', 2)
  expectEmittedPayloadAt('input', 1, 0)

  wrapper.destroy()
})