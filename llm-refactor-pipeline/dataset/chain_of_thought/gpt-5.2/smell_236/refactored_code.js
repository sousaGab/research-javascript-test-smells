it('should scroll to next/prev slide when key next/prev pressed', async () => {
  const wrapper = mount(App, {
    attachTo: document.body,
    propsData: {
      interval: 0,
      controls: true
    }
  })

  const $carousel = wrapper.findComponent(BCarousel)

  const emittedCount = (name) => (($carousel.emitted(name) || []).length)
  const emittedValueAt = (name, index) => $carousel.emitted(name)[index][0]
  const expectNoEmitsYet = () => {
    expect($carousel.emitted('sliding-start')).toBeUndefined()
    expect($carousel.emitted('sliding-end')).toBeUndefined()
    expect($carousel.emitted('input')).toBeUndefined()
  }
  const flushSlide = async () => {
    jest.runOnlyPendingTimers()
    await waitNT(wrapper.vm)
    await waitRAF()
  }

  expect(wrapper.vm).toBeDefined()
  expect($carousel).toBeDefined()
  expect($carousel.vm).toBeDefined()

  await waitNT(wrapper.vm)
  await waitRAF()

  expectNoEmitsYet()

  await $carousel.trigger('keydown.right')

  expect($carousel.emitted('sliding-start')).toBeDefined()
  expect($carousel.emitted('sliding-end')).toBeUndefined()
  expect(emittedCount('sliding-start')).toBe(1)
  expect(emittedValueAt('sliding-start', 0)).toEqual(1)

  await flushSlide()

  expect(emittedCount('sliding-start')).toBe(1)
  expect($carousel.emitted('sliding-end')).toBeDefined()
  expect(emittedCount('sliding-end')).toBe(1)
  expect(emittedValueAt('sliding-end', 0)).toEqual(1)
  expect($carousel.emitted('input')).toBeDefined()
  expect(emittedCount('input')).toBe(1)
  expect(emittedValueAt('input', 0)).toEqual(1)

  await $carousel.trigger('keydown.left')

  expect(emittedCount('sliding-start')).toBe(2)
  expect(emittedCount('sliding-end')).toBe(1)
  expect(emittedValueAt('sliding-start', 1)).toEqual(0)

  await flushSlide()

  expect(emittedCount('sliding-start')).toBe(2)
  expect(emittedCount('sliding-end')).toBe(2)
  expect(emittedValueAt('sliding-end', 1)).toEqual(0)
  expect(emittedCount('input')).toBe(2)
  expect(emittedValueAt('input', 1)).toEqual(0)

  wrapper.destroy()
})