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
    // Including bookend buttons
    expect(lis.length).toBe(11)

    // Should have the last 4 page buttons with the
    // display classes when currentPage = 0
    expect(wrapper.vm.computedCurrentPage).toBe(1)
    // Grab the page buttons (includes bookends)
    const firstPageButtons = wrapper.findAll('li').wrappers
    firstPageButtons.forEach((li, index) => {
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

    // Should have the first and last 2 pages buttons with the
    // display classes when currentPage = 4
    await wrapper.setProps({
      value: '4'
    })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(4)
    // Grab the page buttons (including bookends)
    const middlePageButtons = wrapper.findAll('li').wrappers
    middlePageButtons.forEach((li, index) => {
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

    // Should have the first 4 pages buttons with the
    // display classes when currentPage = 4
    await wrapper.setProps({
      value: '7'
    })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(7)
    // Grab the page buttons (including bookends)
    const lastPageButtons = wrapper.findAll('li').wrappers
    lastPageButtons.forEach((li, index) => {
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