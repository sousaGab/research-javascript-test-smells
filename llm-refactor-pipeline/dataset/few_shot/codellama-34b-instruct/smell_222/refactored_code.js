it('renders classes bv-d-xs-down-none when more than 3 pages', async () => {
  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    }
  })

  // Check that the component renders correctly
  expect(wrapper.element.tagName).toBe('UL')
  const lis = wrapper.findAll('li')
  expect(lis).toBeDefined()
  expect(lis.length).toBe(11)

  // Check that the page buttons have the correct classes
  wrapper.findAll('li').wrappers.forEach((li, index) => {
    expect(li.classes()).toContain('page-item')
    if (index === 0) {
      // First button
      expect(li.classes()).toContain('disabled')
    } else if (index === 1) {
      // Prev button
      expect(li.classes()).toContain('disabled')
    } else if (index === 9) {
      // Next button
      expect(li.classes()).not.toContain('disabled')
    } else if (index === 10) {
      // Last button
      expect(li.classes()).not.toContain('disabled')
    } else {
      // Page number buttons
      if (index === 2) {
        expect(li.classes()).toContain('active')
      } else {
        expect(li.classes()).not.toContain('active')
      }
      if (index < 5) {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      } else if (index > 4) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      }
    }
  })

  // Check that the component updates correctly when the current page changes
  await wrapper.setProps({
    value: '4'
  })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(4)
  wrapper.findAll('li').wrappers.forEach((li, index) => {
    expect(li.classes()).toContain('page-item')
    if (index === 0) {
      // First button
      expect(li.classes()).not.toContain('disabled')
    } else if (index === 1) {
      // Prev button
      expect(li.classes()).not.toContain('disabled')
    } else if (index === 9) {
      // Next button
      expect(li.classes()).not.toContain('disabled')
    } else if (index === 10) {
      // Last button
      expect(li.classes()).not.toContain('disabled')
    } else {
      // Page number buttons
      if (index === 5) {
        expect(li.classes()).toContain('active')
      } else {
        expect(li.classes()).not.toContain('active')
      }
      if (index > 3 && index < 7) {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      } else if (index < 4 || index > 6) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      }
    }
  })

  // Check that the component updates correctly when the current page changes
  await wrapper.setProps({
    value: '7'
  })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(7)
  wrapper.findAll('li').wrappers.forEach((li, index) => {
    expect(li.classes()).toContain('page-item')
    // Page number buttons
    if (index >= 2 && index <= 5) {
      // Pages 1 to 4
      expect(li.classes()).toContain('bv-d-xs-down-none')
    } else if (index >= 6 && index <= 8) {
      // Pages 5 to 7
      expect(li.classes()).not.toContain('bv-d-xs-down-none')
    }
  })

  wrapper.destroy()
})