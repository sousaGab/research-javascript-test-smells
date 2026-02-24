it('should scroll to next/prev slide when key next/prev pressed', async () => {
  const wrapper = mount(App, {
    attachTo: document.body,
    propsData: {
      interval: 0,
      controls: true
    }
  })

  const getEvent = (name) => $carousel.emitted(name)
  const getEventCount = (name) => (getEvent(name) || []).length
  const getEventPayload = (name, callIndex = 0, argIndex = 0) =>
    getEvent(name)?.[callIndex]?.[argIndex]

  expect(wrapper.vm).toBeDefined()
  const $carousel = wrapper.findComponent(BCarousel)
  expect($carousel).toBeDefined()
  expect($carousel.vm).toBeDefined()

  await waitNT(wrapper.vm)
  await waitRAF()

  expect(getEvent('sliding-start')).toBeUndefined()
  expect(getEvent('sliding-end')).toBeUndefined()
  expect(getEvent('input')).toBeUndefined()

  await $carousel.trigger('keydown.right')

  expect(getEvent('sliding-start')).toBeDefined()
  expect(getEvent('sliding-end')).toBeUndefined()
  expect(getEventCount('sliding-start')).toBe(1)
  expect(getEventPayload('sliding-start')).toEqual(1)

  jest.runOnlyPendingTimers()
  await waitNT(wrapper.vm)
  await waitRAF()

  expect(getEventCount('sliding-start')).toBe(1)
  expect(getEvent('sliding-end')).toBeDefined()
  expect(getEventCount('sliding-end')).toBe(1)
  expect(getEventPayload('sliding-end')).toEqual(1)
  expect(getEvent('input')).toBeDefined()
  expect(getEventCount('input')).toBe(1)
  expect(getEventPayload('input')).toEqual(1)

  await $carousel.trigger('keydown.left')

  expect(getEventCount('sliding-start')).toBe(2)
  expect(getEventCount('sliding-end')).toBe(1)
  expect(getEventPayload('sliding-start', 1)).toEqual(0)

  jest.runOnlyPendingTimers()
  await waitNT(wrapper.vm)
  await waitRAF()

  expect(getEventCount('sliding-start')).toBe(2)
  expect(getEventCount('sliding-end')).toBe(2)
  expect(getEventPayload('sliding-end', 1)).toEqual(0)
  expect(getEventCount('input')).toBe(2)
  expect(getEventPayload('input', 1)).toEqual(0)

  wrapper.destroy()
})