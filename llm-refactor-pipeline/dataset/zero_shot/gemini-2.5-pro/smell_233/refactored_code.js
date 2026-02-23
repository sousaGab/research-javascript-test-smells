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

  expect(wrapper.emitted('dismissed')).toBeUndefined()
  expect(wrapper.emitted('dismiss-count-down')).toEqual([
    [2]
  ])

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expect(wrapper.emitted('dismiss-count-down')).toEqual([
    [2],
    [1]
  ])

  // Reset countdown
  await wrapper.setProps({
    show: 3
  })
  await waitNT(wrapper.vm)

  expect(wrapper.emitted('dismiss-count-down')).toEqual([
    [2],
    [1],
    [3]
  ])

  // Run new countdown to completion
  const startValue = 3
  const initialEmitCount = wrapper.emitted('dismiss-count-down').length

  for (let i = 1; i <= startValue; i++) {
    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    const expectedEmitCount = initialEmitCount + i
    const expectedCountdownValue = startValue - i
    expect(wrapper.emitted('dismiss-count-down')).toHaveLength(expectedEmitCount)
    expect(wrapper.emitted('dismiss-count-down')[expectedEmitCount - 1][0]).toBe(
      expectedCountdownValue
    )
  }

  // Just to make sure there aren't any more timers pending
  jest.runAllTimers()
  await waitNT(wrapper.vm)

  expect(wrapper.emitted('dismiss-count-down')).toHaveLength(6)

  await waitNT(wrapper.vm)
  await waitRAF()
  expect(wrapper.emitted('dismissed')).toBeDefined()
  expect(wrapper.emitted('dismissed')).toHaveLength(1)
  expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

  wrapper.destroy()
})