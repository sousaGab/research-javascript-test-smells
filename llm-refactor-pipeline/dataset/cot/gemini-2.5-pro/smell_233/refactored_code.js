it('dismiss countdown handles when show value is changed', async () => {
  jest.useFakeTimers()
  const wrapper = mount(BAlert, {
    propsData: {
      show: 2
    }
  })

  const assertLastCountdownEmit = (value) => {
    const events = wrapper.emitted('dismiss-count-down')
    expect(events).toBeDefined()
    expect(events[events.length - 1]).toEqual([value])
  }

  await waitNT(wrapper.vm)

  // Initial countdown from 2
  expect(wrapper.emitted('dismissed')).toBeUndefined()
  assertLastCountdownEmit(2)

  jest.runTimersToTime(1000)
  await waitNT(wrapper.vm)
  assertLastCountdownEmit(1)

  // Reset countdown to 3
  await wrapper.setProps({
    show: 3
  })
  await waitNT(wrapper.vm)
  assertLastCountdownEmit(3)

  // Loop through the new countdown
  const newCountdown = 3
  for (let i = newCountdown - 1; i >= 0; i--) {
    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)
    assertLastCountdownEmit(i)
  }

  // Verify total number of countdown events
  // Initial(1) + Tick(1) + Reset(1) + Ticks(3) = 6
  expect(wrapper.emitted('dismiss-count-down')).toHaveLength(6)

  // Final state after countdown finishes
  await waitRAF()
  expect(wrapper.emitted('dismissed')).toHaveLength(1)
  expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

  wrapper.destroy()
})