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

    const emitted = () => wrapper.emitted('dismiss-count-down')

    expect(wrapper.emitted('dismissed')).toBeUndefined()
    expect(emitted()).toBeDefined()
    expect(emitted().length).toBe(1)
    expect(emitted()[0][0]).toBe(2)

    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    expect(emitted().length).toBe(2)
    expect(emitted()[1][0]).toBe(1)

    await wrapper.setProps({ show: 3 })
    expect(emitted().length).toBe(3)
    expect(emitted()[2][0]).toBe(3)

    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    expect(emitted().length).toBe(4)
    expect(emitted()[3][0]).toBe(2)

    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    expect(emitted().length).toBe(5)
    expect(emitted()[4][0]).toBe(1)

    jest.runTimersToTime(1000)
    await waitNT(wrapper.vm)

    expect(emitted().length).toBe(6)
    expect(emitted()[5][0]).toBe(0)

    jest.runAllTimers()
    await waitNT(wrapper.vm)

    expect(emitted().length).toBe(6)

    await waitNT(wrapper.vm)
    await waitRAF()
    expect(wrapper.emitted('dismissed')).toBeDefined()
    expect(wrapper.emitted('dismissed').length).toBe(1)
    expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE)

    wrapper.destroy()
  })