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
  expect(wrapper.emitted('dismiss-count-down')).toBeDefined()
  expect(wrapper.emitted('dismiss-count-down')).toHaveLength(1)
  expect(wrapper.emitted('dismiss-count-down')[0][0]).toBe(2)

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expect(wrapper.emitted('dismiss-count-down')).toHaveLength(2)
  expect(wrapper.emitted('dismiss-count-down')[1][0]).toBe(1)

  await wrapper.setProps({ show: 3 })
  expect(wrapper.emitted('dismiss-count-down')).toHaveLength(3)
  expect(wrapper.emitted('dismiss-count-down')[2][0]).toBe(3)

  const countdownChecks = [
    { expectedLength: 4, expectedValue: 2 },
    { expectedLength: 5, expectedValue: 1 },
    { expectedLength: 6, expectedValue: 0 }
  ]

  for (const check of countdownChecks) {
    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)
    expect(wrapper.emitted('dismiss-count-down')).toHaveLength(check.expectedLength)
    expect(wrapper.emitted('dismiss-count-down')[check.expectedLength - 1][0]).toBe(check.expectedValue)
  }

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