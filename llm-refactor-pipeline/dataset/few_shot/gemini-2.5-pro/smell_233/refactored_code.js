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
  expect(wrapper.emitted('dismiss-count-down')).toEqual([
    [2],
    [1],
    [3]
  ])

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expect(wrapper.emitted('dismiss-count-down')).toEqual([
    [2],
    [1],
    [3],
    [2]
  ])

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expect(wrapper.emitted('dismiss-count-down')).toEqual([
    [2],
    [1],
    [3],
    [2],
    [1]
  ])

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)

  expect(wrapper.emitted('dismiss-count-down')).toEqual([
    [2],
    [1],
    [3],
    [2],
    [1],
    [0]
  ])

  // Just to make sure there aren't any more timers pending
  jest.runAllTimers()
  await waitNT(wrapper.vm)

  expect(wrapper.emitted('dismiss-count-down')).toHaveLength(6)

  await waitNT(wrapper.vm)
  await waitRAF()
  expect(wrapper.emitted('dismissed')).toHaveLength(1)
  expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

  wrapper.destroy()
})