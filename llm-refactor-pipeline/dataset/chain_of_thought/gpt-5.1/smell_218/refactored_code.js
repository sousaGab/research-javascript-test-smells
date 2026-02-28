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

  expect(wrapper.element.tagName).toBe('DIV')
  expect(wrapper.classes()).toContain('carousel')
  expect(wrapper.classes()).toContain('slide')
  expect(wrapper.classes().length).toBe(2)
  expect(wrapper.attributes('id')).toBeDefined()
  const id = wrapper.attributes('id')

  expect(wrapper.findAll('.carousel > .carousel-inner').length).toBe(1)

  expect(wrapper.findAll('.carousel > .carousel-control-prev').length).toBe(1)
  expect(wrapper.findAll('.carousel > .carousel-control-next').length).toBe(1)
  expect(wrapper.findAll('a').length).toBe(2)

  const $prev = wrapper.find('.carousel > .carousel-control-prev')
  const $next = wrapper.find('.carousel > .carousel-control-next')

  expect($prev.element.tagName).toBe('A')
  expect($next.element.tagName).toBe('A')
  expect($prev.attributes('href')).toEqual('#')
  expect($next.attributes('href')).toEqual('#')
  expect($prev.attributes('role')).toEqual('button')
  expect($next.attributes('role')).toEqual('button')
  expect($prev.attributes('aria-controls')).toEqual(`${id}___BV_inner_`)
  expect($next.attributes('aria-controls')).toEqual(`${id}___BV_inner_`)
  expect($prev.classes()).toContain('carousel-control-prev')
  expect($next.classes()).toContain('carousel-control-next')
  expect($prev.classes().length).toBe(1)
  expect($next.classes().length).toBe(1)

  expect(wrapper.findAll('.carousel > ol').length).toBe(1)
  const $indicators = wrapper.find('.carousel > ol')
  expect($indicators.classes()).toContain('carousel-indicators')
  expect($indicators.classes().length).toBe(1)
  expect($indicators.element.style.display).toEqual('none')

  wrapper.destroy()
})