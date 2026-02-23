it('dismiss countdown handles when show value is changed', async () => {
  jest.useFakeTimers()

  const wrapper = mount(BAlert, {
    propsData: { show: 2 }
  })

  expect(wrapper.vm).toBeDefined()
  expect(wrapper.html()).toBeDefined()

  const emittedCountDownValues = () =>
    (wrapper.emitted('dismiss-count-down') || []).map(args => args[0])

  const expectCountDownValues = expected => {
    expect(wrapper.emitted('dismissed')).toBeUndefined()
    expect(wrapper.emitted('dismiss-count-down')).toBeDefined()
    expect(emittedCountDownValues()).toEqual(expected)
  }

  const tick = async (ms = 1000) => {
    jest.runTimersToTime(ms)
    await waitNT(wrapper.vm)
  }

  await waitNT(wrapper.vm)
  expectCountDownValues([2])

  await tick()
  expectCountDownValues([2, 1])

  // Reset countdown
  await wrapper.setProps({ show: 3 })
  expectCountDownValues([2, 1, 3])

  await tick()
  expectCountDownValues([2, 1, 3, 2])

  await tick()
  expectCountDownValues([2, 1, 3, 2, 1])

  await tick()
  expectCountDownValues([2, 1, 3, 2, 1, 0])

  // Just to make sure there aren't any more timers pending
  jest.runAllTimers()
  await waitNT(wrapper.vm)
  expectCountDownValues([2, 1, 3, 2, 1, 0])

  await waitNT(wrapper.vm)
  await waitRAF()
  expect(wrapper.emitted('dismissed')).toBeDefined()
  expect(wrapper.emitted('dismissed').length).toBe(1)
  expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

  wrapper.destroy()
})