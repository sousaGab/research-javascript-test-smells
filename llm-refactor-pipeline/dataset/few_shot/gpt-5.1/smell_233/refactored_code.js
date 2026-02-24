it('dismiss countdown handles when show value is changed', async () => {
  jest.useFakeTimers()
  const wrapper = mount(BAlert, {
    propsData: {
      show: 2
    }
  })

  expect(wrapper.vm).toBeDefined()
  expect(wrapper.html()).toBeDefined()

  await waitNT(wrapper.vm)

  const getDismissCountDownEmits = () => wrapper.emitted('dismiss-count-down') || []
  const expectDismissCountDownEmit = (index, value) => {
    const emits = getDismissCountDownEmits()
    expect(emits.length).toBe(index + 1)
    expect(emits[index][0]).toBe(value)
  }

  expect(wrapper.emitted('dismissed')).toBeUndefined()
  expect(getDismissCountDownEmits()).toBeDefined()
  expectDismissCountDownEmit(0, 2) // 2 - 0

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expectDismissCountDownEmit(1, 1) // 2 - 1

  // Reset countdown
  await wrapper.setProps({ show: 3 })
  expectDismissCountDownEmit(2, 3) // 3 - 0

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expectDismissCountDownEmit(3, 2) // 3 - 1

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expectDismissCountDownEmit(4, 1) // 3 - 2

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expectDismissCountDownEmit(5, 0) // 3 - 3

  // Just to make sure there aren't any more timers pending
  jest.runAllTimers()
  await waitNT(wrapper.vm)

  expect(getDismissCountDownEmits().length).toBe(6)

  await waitNT(wrapper.vm)
  await waitRAF()
  expect(wrapper.emitted('dismissed')).toBeDefined()
  expect(wrapper.emitted('dismissed').length).toBe(1)
  expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

  wrapper.destroy()
})