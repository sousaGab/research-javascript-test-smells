it('dismiss countdown handles when show value is changed', async () => {
  jest.useFakeTimers()
  const wrapper = mount(BAlert, {
    propsData: {
      show: 2
    }
  })

  const getDismissCountDownEvents = () => wrapper.emitted('dismiss-count-down') || []
  const getDismissedEvents = () => wrapper.emitted('dismissed') || []
  const expectDismissCountDownEvent = (index, expectedValue) => {
    const events = getDismissCountDownEvents()
    expect(events.length).toBe(index + 1)
    expect(events[index][0]).toBe(expectedValue)
  }

  expect(wrapper.vm).toBeDefined()
  expect(wrapper.html()).toBeDefined()

  await waitNT(wrapper.vm)

  expect(wrapper.emitted('dismissed')).toBeUndefined()
  expect(getDismissCountDownEvents()).toBeDefined()
  expectDismissCountDownEvent(0, 2) // 2 - 0

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expectDismissCountDownEvent(1, 1) // 2 - 1

  // Reset countdown
  await wrapper.setProps({ show: 3 })
  expectDismissCountDownEvent(2, 3) // 3 - 0

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expectDismissCountDownEvent(3, 2) // 3 - 1

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expectDismissCountDownEvent(4, 1) // 3 - 2

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expectDismissCountDownEvent(5, 0) // 3 - 3

  // Just to make sure there aren't any more timers pending
  jest.runAllTimers()
  await waitNT(wrapper.vm)

  expect(getDismissCountDownEvents().length).toBe(6)

  await waitNT(wrapper.vm)
  await waitRAF()
  expect(getDismissedEvents()).toBeDefined()
  expect(getDismissedEvents().length).toBe(1)
  expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

  wrapper.destroy()
})