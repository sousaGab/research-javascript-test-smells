it('dismiss countdown handles when show value is changed', async () => {
  jest.useFakeTimers()

  const wrapper = mount(BAlert, {
    propsData: { show: 2 }
  })

  const getDismissed = () => wrapper.emitted('dismissed')
  const getCountDown = () => wrapper.emitted('dismiss-count-down') || []

  const expectCountDown = (expectedValues) => {
    const events = getCountDown()
    expect(events).toBeDefined()
    expect(events.length).toBe(expectedValues.length)
    expectedValues.forEach((value, idx) => {
      expect(events[idx][0]).toBe(value)
    })
  }

  const tick = async (ms = 1000) => {
    jest.advanceTimersByTime(ms)
    await waitNT(wrapper.vm)
  }

  expect(wrapper.vm).toBeDefined()
  expect(wrapper.html()).toBeDefined()

  await waitNT(wrapper.vm)

  expect(getDismissed()).toBeUndefined()
  expectCountDown([2])

  await tick(1000)
  expectCountDown([2, 1])

  // Reset countdown
  await wrapper.setProps({ show: 3 })
  expectCountDown([2, 1, 3])

  await tick(1000)
  expectCountDown([2, 1, 3, 2])

  await tick(1000)
  expectCountDown([2, 1, 3, 2, 1])

  await tick(1000)
  expectCountDown([2, 1, 3, 2, 1, 0])

  // Just to make sure there aren't any more timers pending
  jest.runAllTimers()
  await waitNT(wrapper.vm)
  expectCountDown([2, 1, 3, 2, 1, 0])

  await waitNT(wrapper.vm)
  await waitRAF()
  expect(getDismissed()).toBeDefined()
  expect(getDismissed().length).toBe(1)
  expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

  wrapper.destroy()
})