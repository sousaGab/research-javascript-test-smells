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

  const emitted = wrapper.emitted()
  expect(emitted.dismissed).toBeUndefined()
  expect(emitted['dismiss-count-down']).toBeDefined()
  
  const dismissCountDownEvents = emitted['dismiss-count-down']
  expect(dismissCountDownEvents).toHaveLength(1)
  expect(dismissCountDownEvents[0][0]).toBe(2)

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expect(dismissCountDownEvents).toHaveLength(2)
  expect(dismissCountDownEvents[1][0]).toBe(1)

  await wrapper.setProps({ show: 3 })
  expect(dismissCountDownEvents).toHaveLength(3)
  expect(dismissCountDownEvents[2][0]).toBe(3)

  const timeSteps = [
    { expectedLength: 4, expectedValue: 2 },
    { expectedLength: 5, expectedValue: 1 },
    { expectedLength: 6, expectedValue: 0 }
  ]

  for (const step of timeSteps) {
    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)
    expect(dismissCountDownEvents).toHaveLength(step.expectedLength)
    expect(dismissCountDownEvents[step.expectedLength - 1][0]).toBe(step.expectedValue)
  }

  jest.runAllTimers()
  await waitNT(wrapper.vm)
  expect(dismissCountDownEvents).toHaveLength(6)

  await waitNT(wrapper.vm)
  await waitRAF()
  expect(emitted.dismissed).toBeDefined()
  expect(emitted.dismissed).toHaveLength(1)
  expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

  wrapper.destroy()
})