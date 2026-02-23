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

  expect(wrapper.find('.carousel-inner').exists()).toBe(true)

  const prevControl = wrapper.find('.carousel-control-prev')
  expect(prevControl.exists()).toBe(true)
  expect(prevControl.element.tagName).toBe('A')
  expect(prevControl.attributes('href')).toEqual('#')
  expect(prevControl.attributes('role')).toEqual('button')
  expect(prevControl.attributes('aria-controls')).toEqual(`${id}___BV_inner_`)
  expect(prevControl.classes()).toEqual(['carousel-control-prev'])

  const nextControl = wrapper.find('.carousel-control-next')
  expect(nextControl.exists()).toBe(true)
  expect(nextControl.element.tagName).toBe('A')
  expect(nextControl.attributes('href')).toEqual('#')
  expect(nextControl.attributes('role')).toEqual('button')
  expect(nextControl.attributes('aria-controls')).toEqual(`${id}___BV_inner_`)
  expect(nextControl.classes()).toEqual(['carousel-control-next'])

  expect(wrapper.findAll('a').length).toBe(2)

  const indicators = wrapper.find('ol.carousel-indicators')
  expect(indicators.exists()).toBe(true)
  expect(indicators.classes()).toEqual(['carousel-indicators'])
  expect(indicators.element.style.display).toEqual('none')

  wrapper.destroy()
})