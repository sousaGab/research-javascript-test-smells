it('dismiss countdown handles when show value is changed', async () => {
  const expectDismissCountDown = (wrapper, index, expectedValue) => {
    const events = wrapper.emitted('dismiss-count-down') || []
    expect(events.length).toBe(index + 1)
    expect(events[index][0]).toBe(expectedValue)
  }

  const advanceOneSecond = async wrapper => {
    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)
  }

  jest.useFakeTimers()
  const wrapper = mount(BAlert, {
    propsData: {
      show: 2
    }
  })

  expect(wrapper.vm).toBeDefined()
  expect(wrapper.html()).toBeDefined()

  await waitNT(wrapper.vm)

  expect(wrapper.emitted('dismissed')).toBeUndefined()
  expect(wrapper.emitted('dismiss-count-down')).toBeDefined()
  expectDismissCountDown(wrapper, 0, 2) // 2 - 0

  await advanceOneSecond(wrapper)
  expectDismissCountDown(wrapper, 1, 1) // 2 - 1

  // Reset countdown
  await wrapper.setProps({ show: 3 })
  expectDismissCountDown(wrapper, 2, 3) // 3 - 0

  await advanceOneSecond(wrapper)
  expectDismissCountDown(wrapper, 3, 2) // 3 - 1

  await advanceOneSecond(wrapper)
  expectDismissCountDown(wrapper, 4, 1) // 3 - 2

  await advanceOneSecond(wrapper)
  expectDismissCountDown(wrapper, 5, 0) // 3 - 3

  // Just to make sure there aren't any more timers pending
  jest.runAllTimers()
  await waitNT(wrapper.vm)

  expect((wrapper.emitted('dismiss-count-down') || []).length).toBe(6)

  await waitNT(wrapper.vm)
  await waitRAF()
  expect(wrapper.emitted('dismissed')).toBeDefined()
  expect(wrapper.emitted('dismissed').length).toBe(1)
  expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

  wrapper.destroy()
})