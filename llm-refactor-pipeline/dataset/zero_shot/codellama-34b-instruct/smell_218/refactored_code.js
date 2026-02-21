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
    const outerWrapper = wrapper.element
    expect(outerWrapper.tagName).toBe('DIV')
    expect(outerWrapper.classes()).toContain('carousel')
    expect(outerWrapper.classes()).toContain('slide')
    expect(outerWrapper.classes().length).toBe(2)
    expect(outerWrapper.attributes('id')).toBeDefined()
    const id = outerWrapper.attributes('id')

    // Slide wrapper
    const slideWrapper = wrapper.findAll('.carousel > .carousel-inner').at(0)
    expect(slideWrapper.length).toBe(1)

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