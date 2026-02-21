it('has prev/next controls when prop controls is set', async () => {
    const wrapper = mount(BCarousel, {
      attachTo: document.body,
      propsData: {
        controls: true
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    // Outer wrapper
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('carousel')
    expect(wrapper.classes()).toContain('slide')
    expect(wrapper.classes().length).toBe(2)
    expect(wrapper.attributes('id')).toBeDefined()
    const id = wrapper.attributes('id')

    // Slide wrapper
    expect(wrapper.findAll('.carousel > .carousel-inner').length).toBe(1)

    // Controls
    const prevControl = wrapper.find('.carousel > .carousel-control-prev')
    const nextControl = wrapper.find('.carousel > .carousel-control-next')
    expect(prevControl.element.tagName).toBe('A')
    expect(nextControl.element.tagName).toBe('A')
    expect(prevControl.attributes('href')).toEqual('#')
    expect(nextControl.attributes('href')).toEqual('#')
    expect(prevControl.attributes('role')).toEqual('button')
    expect(nextControl.attributes('role')).toEqual('button')
    expect(prevControl.attributes('aria-controls')).toEqual(`${id}___BV_inner_`)
    expect(nextControl.attributes('aria-controls')).toEqual(`${id}___BV_inner_`)
    expect(prevControl.classes()).toContain('carousel-control-prev')
    expect(nextControl.classes()).toContain('carousel-control-next')
    expect(prevControl.classes().length).toBe(1)
    expect(nextControl.classes().length).toBe(1)

    // Indicators (hidden by default)
    const indicators = wrapper.find('.carousel > ol')
    expect(indicators.classes()).toContain('carousel-indicators')
    expect(indicators.classes().length).toBe(1)
    expect(indicators.element.style.display).toEqual('none')

    wrapper.destroy()
  })