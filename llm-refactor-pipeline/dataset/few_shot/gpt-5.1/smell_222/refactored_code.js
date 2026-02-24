it('renders correct classes for pagination when more than 3 pages', async () => {
  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    }
  })

  const expectCommonButtonClasses = (li, { isDisabled, isActive, isHidden }) => {
    expect(li.classes()).toContain('page-item')
    if (typeof isDisabled === 'boolean') {
      if (isDisabled) {
        expect(li.classes()).toContain('disabled')
      } else {
        expect(li.classes()).not.toContain('disabled')
      }
    }
    if (typeof isActive === 'boolean') {
      if (isActive) {
        expect(li.classes()).toContain('active')
      } else {
        expect(li.classes()).not.toContain('active')
      }
    }
    if (typeof isHidden === 'boolean') {
      if (isHidden) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      } else {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      }
    }
  }

  expect(wrapper.element.tagName).toBe('UL')
  const lis = wrapper.findAll('li')
  expect(lis).toBeDefined()
  expect(lis.length).toBe(11)

  expect(wrapper.vm.computedCurrentPage).toBe(1)

  wrapper.findAll('li').wrappers.forEach((li, index) => {
    if (index === 0 || index === 1) {
      expectCommonButtonClasses(li, { isDisabled: true })
    } else if (index === 9 || index === 10) {
      expectCommonButtonClasses(li, { isDisabled: false })
    } else {
      const isActive = index === 2
      const isHidden = index > 4
      expectCommonButtonClasses(li, { isDisabled: false, isActive, isHidden })
    }
  })

  await wrapper.setProps({
    value: '4'
  })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(4)

  wrapper.findAll('li').wrappers.forEach((li, index) => {
    if (index === 0 || index === 1 || index === 9 || index === 10) {
      expectCommonButtonClasses(li, { isDisabled: false })
    } else {
      const isActive = index === 5
      const isHidden = index < 4 || index > 6
      expectCommonButtonClasses(li, { isDisabled: false, isActive, isHidden })
    }
  })

  await wrapper.setProps({
    value: '7'
  })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(7)

  wrapper.findAll('li').wrappers.forEach((li, index) => {
    if (index >= 2 && index <= 5) {
      expectCommonButtonClasses(li, { isHidden: true })
    } else if (index >= 6 && index <= 8) {
      expectCommonButtonClasses(li, { isHidden: false })
    } else {
      expect(li.classes()).toContain('page-item')
    }
  })

  wrapper.destroy()
})