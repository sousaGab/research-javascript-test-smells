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
    expect(wrapper.emitted('dismiss-count-down').length).toBe(1)
    expect(wrapper.emitted('dismiss-count-down')[0][0]).toBe(2)

    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    expect(wrapper.emitted('dismiss-count-down').length).toBe(2)
    expect(wrapper.emitted('dismiss-count-down')[1][0]).toBe(1)

    // Reset countdown
    await wrapper.setProps({ show: 3 })
    expect(wrapper.emitted('dismiss-count-down').length).toBe(3)
    expect(wrapper.emitted('dismiss-count-down')[2][0]).toBe(3)

    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    expect(wrapper.emitted('dismiss-count-down').length).toBe(4)
    expect(wrapper.emitted('dismiss-count-down')[3][0]).toBe(2)

    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    expect(wrapper.emitted('dismiss-count-down').length).toBe(5)
    expect(wrapper.emitted('dismiss-count-down')[4][0]).toBe(1)

    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    expect(wrapper.emitted('dismiss-count-down').length).toBe(6)
    expect(wrapper.emitted('dismiss-count-down')[5][0]).toBe(0)

    // Just to make sure there aren't any more timers pending
    jest.runAllTimers()
    await waitNT(wrapper.vm)

    expect(wrapper.emitted('dismiss-count-down').length).toBe(6)

    await waitNT(wrapper.vm)
    await waitRAF()
    expect(wrapper.emitted('dismissed')).toBeDefined()
    expect(wrapper.emitted('dismissed').length).toBe(1)
    expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

    wrapper.destroy()
  })