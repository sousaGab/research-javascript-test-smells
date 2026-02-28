it('dismiss countdown handles when show value is changed', async () => {
  jest.useFakeTimers()
  const wrapper = mount(BAlert, {
    propsData: { show: 2 }
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

  const expectedCounts = [2, 1, 0]
  for (let i = 0; i < expectedCounts.length; i++) {
    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)
    expect(wrapper.emitted('dismiss-count-down')).toHaveLength(4 + i)
    expect(wrapper.emitted('dismiss-count-down')[3 + i][0]).toBe(expectedCounts[i])
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