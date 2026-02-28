it('renders classes bv-d-xs-down-none when more than 3 pages', async () => {
  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    }
  })

  expect(wrapper.element.tagName).toBe('UL')
  const lis = wrapper.findAll('li')
  expect(lis).toBeDefined()
  expect(lis.length).toBe(11)

  const verifyButtonClasses = (buttons, activeIndex, hiddenStart, hiddenEnd) => {
    buttons.forEach((li, index) => {
      expect(li.classes()).toContain('page-item')

      const isFirst = index === 0
      const isPrev = index === 1
      const isNext = index === buttons.length - 2
      const isLast = index === buttons.length - 1
      const isPageButton = !isFirst && !isPrev && !isNext && !isLast

      if (isFirst) {
        expect(li.classes()).toContain('disabled')
      } else if (isPrev) {
        expect(li.classes()).toContain('disabled')
      } else if (isNext) {
        expect(li.classes()).not.toContain('disabled')
      } else if (isLast) {
        expect(li.classes()).not.toContain('disabled')
      } else if (isPageButton) {
        const expectedActive = index === activeIndex
        expect(li.classes()).toContain(expectedActive ? 'active' : 'active', expectedActive)

        const shouldBeHidden = index < hiddenStart || index > hiddenEnd
        expect(li.classes()).toContain(shouldBeHidden ? 'bv-d-xs-down-none' : 'bv-d-xs-down-none', shouldBeHidden)
      }
    })
  }

  expect(wrapper.vm.computedCurrentPage).toBe(1)
  verifyButtonClasses(wrapper.findAll('li').wrappers, 2, 5, 4)

  await wrapper.setProps({ value: '4' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(4)
  verifyButtonClasses(wrapper.findAll('li').wrappers, 5, 4, 6)

  await wrapper.setProps({ value: '7' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(7)

  wrapper.findAll('li').wrappers.forEach((li, index) => {
    expect(li.classes()).toContain('page-item')
    if (index >= 2 && index <= 5) {
      expect(li.classes()).toContain('bv-d-xs-down-none')
    } else if (index >= 6 && index <= 8) {
      expect(li.classes()).not.toContain('bv-d-xs-down-none')
    }
  })

  wrapper.destroy()
})