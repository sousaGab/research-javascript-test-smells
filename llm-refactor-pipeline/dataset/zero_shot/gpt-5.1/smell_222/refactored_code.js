it('renders classes bv-d-xs-down-none when more than 3 pages', async () => {
  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    }
  })

  const expectCommonButtonClasses = (li, isDisabled) => {
    expect(li.classes()).toContain('page-item')
    if (isDisabled) {
      expect(li.classes()).toContain('disabled')
    } else {
      expect(li.classes()).not.toContain('disabled')
    }
  }

  const expectActiveState = (li, isActive) => {
    if (isActive) {
      expect(li.classes()).toContain('active')
    } else {
      expect(li.classes()).not.toContain('active')
    }
  }

  const expectVisibilityClass = (li, shouldBeHidden) => {
    if (shouldBeHidden) {
      expect(li.classes()).toContain('bv-d-xs-down-none')
    } else {
      expect(li.classes()).not.toContain('bv-d-xs-down-none')
    }
  }

  expect(wrapper.element.tagName).toBe('UL')
  const lis = wrapper.findAll('li')
  expect(lis).toBeDefined()
  expect(lis.length).toBe(11)

  expect(wrapper.vm.computedCurrentPage).toBe(1)

  wrapper.findAll('li').wrappers.forEach((li, index) => {
    expectCommonButtonClasses(li, index === 0 || index === 1)

    if (index === 9 || index === 10) {
      expect(li.classes()).not.toContain('disabled')
      return
    }

    if (index >= 2 && index <= 8) {
      expectActiveState(li, index === 2)
      expectVisibilityClass(li, index > 4)
    }
  })

  await wrapper.setProps({
    value: '4'
  })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(4)

  wrapper.findAll('li').wrappers.forEach((li, index) => {
    const isDisabled = false
    expectCommonButtonClasses(li, isDisabled)

    if (index === 0 || index === 1 || index === 9 || index === 10) {
      expect(li.classes()).not.toContain('disabled')
      return
    }

    if (index >= 2 && index <= 8) {
      expectActiveState(li, index === 5)
      const shouldBeHidden = index < 4 || index > 6
      expectVisibilityClass(li, shouldBeHidden)
    }
  })

  await wrapper.setProps({
    value: '7'
  })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(7)

  wrapper.findAll('li').wrappers.forEach((li, index) => {
    expectCommonButtonClasses(li, false)

    if (index >= 2 && index <= 5) {
      expectVisibilityClass(li, true)
    } else if (index >= 6 && index <= 8) {
      expectVisibilityClass(li, false)
    }
  })

  wrapper.destroy()
})