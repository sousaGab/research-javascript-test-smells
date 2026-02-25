it('dismiss countdown handles when show value is changed', async () => {
  jest.useFakeTimers()
  const wrapper = mount(BAlert, {
    propsData: {
      show: 2
    }
  })

  expect(wrapper.vm).toBeDefined()
  expect(wrapper.html()).toBeDefined()
  expect(wrapper.emitted('dismissed')).toBeUndefined()

  // Initial countdown from 2
  await waitNT(wrapper.vm)
  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)
  expect(wrapper.emitted('dismiss-count-down')).toEqual([
    [2],
    [1]
  ])

  // Reset countdown to 3
  await wrapper.setProps({
    show: 3
  })
  expect(wrapper.emitted('dismiss-count-down')).toEqual([
    [2],
    [1],
    [3]
  ])

  // Countdown from 3 down to 0
  const expectedEmissions = [
    [2],
    [1],
    [3]
  ]
  for (let i = 2; i >= 0; i--) {
    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)
    expectedEmissions.push([i])
    expect(wrapper.emitted('dismiss-count-down')).toEqual(expectedEmissions)
  }

  // Ensure no more timers are pending
  jest.runAllTimers()
  await waitNT(wrapper.vm)
  expect(wrapper.emitted('dismiss-count-down').length).toBe(6)

  // Check for dismissal
  await waitNT(wrapper.vm)
  await waitRAF()
  expect(wrapper.emitted('dismissed')).toHaveLength(1)
  expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

  wrapper.destroy()
})