it('dismiss countdown handles when show value is changed', async () => {
  jest.useFakeTimers()
  const wrapper = mount(BAlert, {
    propsData: {
      show: 2
    }
  })

  const emittedCountDown = () => wrapper.emitted('dismiss-count-down') || []
  const expectCountDownAt = (index, value) => {
    expect(emittedCountDown().length).toBe(index + 1)
    expect(emittedCountDown()[index][0]).toBe(value)
  }
  const tick = async (ms = 1000) => {
    jest.runTimersToTime(ms)
    await waitNT(wrapper.vm)
  }

  expect(wrapper.vm).toBeDefined()
  expect(wrapper.html()).toBeDefined()

  await waitNT(wrapper.vm)

  expect(wrapper.emitted('dismissed')).toBeUndefined()
  expect(wrapper.emitted('dismiss-count-down')).toBeDefined()
  expectCountDownAt(0, 2) // 2 - 0

  await tick()
  expectCountDownAt(1, 1) // 2 - 1

  // Reset countdown
  await wrapper.setProps({ show: 3 })
  expectCountDownAt(2, 3) // 3 - 0

  await tick()
  expectCountDownAt(3, 2) // 3 - 1

  await tick()
  expectCountDownAt(4, 1) // 3 - 2

  await tick()
  expectCountDownAt(5, 0) // 3 - 3

  // Just to make sure there aren't any more timers pending
  jest.runAllTimers()
  await waitNT(wrapper.vm)

  expect(emittedCountDown().length).toBe(6)

  await waitNT(wrapper.vm)
  await waitRAF()
  expect(wrapper.emitted('dismissed')).toBeDefined()
  expect(wrapper.emitted('dismissed').length).toBe(1)
  expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

  wrapper.destroy()
})