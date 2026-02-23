it('dismiss countdown handles when show value is changed', async () => {
    jest.useFakeTimers()
    const wrapper = mount(BAlert, {
      propsData: {
        show: 2
      }
    })

    await waitNT(wrapper.vm)

    const countDown = () => wrapper.emitted('dismiss-count-down')

    expect(wrapper.emitted('dismissed')).toBeUndefined()
    expect(countDown()).toBeDefined()
    expect(countDown().length).toBe(1)
    expect(countDown()[0][0]).toBe(2) // 2 - 0

    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    expect(countDown().length).toBe(2)
    expect(countDown()[1][0]).toBe(1) // 2 - 1

    // Reset countdown
    await wrapper.setProps({ show: 3 })
    expect(countDown().length).toBe(3)
    expect(countDown()[2][0]).toBe(3) // 3 - 0

    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    expect(countDown().length).toBe(4)
    expect(countDown()[3][0]).toBe(2) // 3 - 1

    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    expect(countDown().length).toBe(5)
    expect(countDown()[4][0]).toBe(1) // 3 - 2

    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    expect(countDown().length).toBe(6)
    expect(countDown()[5][0]).toBe(0) // 3 - 3

    // Just to make sure there aren't any more timers pending
    jest.runAllTimers()
    await waitNT(wrapper.vm)

    expect(countDown().length).toBe(6)

    await waitNT(wrapper.vm)
    await waitRAF()
    expect(wrapper.emitted('dismissed')).toBeDefined()
    expect(wrapper.emitted('dismissed').length).toBe(1)
    expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

    wrapper.destroy()
  })