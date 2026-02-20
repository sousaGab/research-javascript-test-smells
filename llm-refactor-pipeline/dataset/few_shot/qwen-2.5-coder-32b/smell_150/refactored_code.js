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
    const firstPageButtonChecks = [
      { index: 0, expectedClass: 'disabled' },
      { index: 1, expectedClass: 'disabled' },
      { index: 9, expectedClass: 'disabled', shouldContain: false },
      { index: 10, expectedClass: 'disabled', shouldContain: false }
    ]
    
    firstPageButtonChecks.forEach(({ index, expectedClass, shouldContain = true }) => {
      const li = wrapper.findAll('li').wrappers[index]
      expect(li.classes()).toContain('page-item')
      if (shouldContain) {
        expect(li.classes()).toContain(expectedClass)
      } else {
        expect(li.classes()).not.toContain(expectedClass)
      }
    })

    // Page number buttons checks for currentPage = 1
    const pageButtonChecks = [
      { index: 2, expectedActive: true, expectedHidden: false },
      { index: 3, expectedActive: false, expectedHidden: false },
      { index: 4, expectedActive: false, expectedHidden: false },
      { index: 5, expectedActive: false, expectedHidden: true },
      { index: 6, expectedActive: false, expectedHidden: true },
      { index: 7, expectedActive: false, expectedHidden: true },
      { index: 8, expectedActive: false, expectedHidden: true },
      { index: 9, expectedActive: false, expectedHidden: true },
      { index: 10, expectedActive: false, expectedHidden: true }
    ]

    pageButtonChecks.forEach(({ index, expectedActive, expectedHidden }) => {
      const li = wrapper.findAll('li').wrappers[index]
      expect(li.classes()).toContain('page-item')
      if (expectedActive) {
        expect(li.classes()).toContain('active')
      } else {
        expect(li.classes()).not.toContain('active')
      }
      if (expectedHidden) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      } else {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      }
    })

    // Should have the first and last 2 pages buttons with the
    // display classes when currentPage = 4
    await wrapper.setProps({
      value: '4'
    })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(4)
    
    const fourthPageButtonChecks = [
      { index: 0, expectedClass: 'disabled', shouldContain: false },
      { index: 1, expectedClass: 'disabled', shouldContain: false },
      { index: 9, expectedClass: 'disabled', shouldContain: false },
      { index: 10, expectedClass: 'disabled', shouldContain: false }
    ]
    
    fourthPageButtonChecks.forEach(({ index, expectedClass, shouldContain = true }) => {
      const li = wrapper.findAll('li').wrappers[index]
      expect(li.classes()).toContain('page-item')
      if (shouldContain) {
        expect(li.classes()).toContain(expectedClass)
      } else {
        expect(li.classes()).not.toContain(expectedClass)
      }
    })

    // Page number buttons checks for currentPage = 4
    const fourthPageNumberChecks = [
      { index: 2, expectedActive: false, expectedHidden: true },
      { index: 3, expectedActive: false, expectedHidden: true },
      { index: 4, expectedActive: false, expectedHidden: true },
      { index: 5, expectedActive: true, expectedHidden: false },
      { index: 6, expectedActive: false, expectedHidden: false },
      { index: 7, expectedActive: false, expectedHidden: false },
      { index: 8, expectedActive: false, expectedHidden: true },
      { index: 9, expectedActive: false, expectedHidden: true },
      { index: 10, expectedActive: false, expectedHidden: true }
    ]

    fourthPageNumberChecks.forEach(({ index, expectedActive, expectedHidden }) => {
      const li = wrapper.findAll('li').wrappers[index]
      expect(li.classes()).toContain('page-item')
      if (expectedActive) {
        expect(li.classes()).toContain('active')
      } else {
        expect(li.classes()).not.toContain('active')
      }
      if (expectedHidden) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      } else {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      }
    })

    // Should have the first 4 pages buttons with the
    // display classes when currentPage = 4
    await wrapper.setProps({
      value: '7'
    })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(7)
    
    // Page number buttons checks for currentPage = 7
    const seventhPageNumberChecks = [
      { index: 2, expectedHidden: true },
      { index: 3, expectedHidden: true },
      { index: 4, expectedHidden: true },
      { index: 5, expectedHidden: true },
      { index: 6, expectedHidden: false },
      { index: 7, expectedHidden: false },
      { index: 8, expectedHidden: false }
    ]

    seventhPageNumberChecks.forEach(({ index, expectedHidden }) => {
      const li = wrapper.findAll('li').wrappers[index]
      expect(li.classes()).toContain('page-item')
      if (expectedHidden) {
        expect(li.classes()).toContain('bv-d-xs-down-none')
      } else {
        expect(li.classes()).not.toContain('bv-d-xs-down-none')
      }
    })

    wrapper.destroy()
  })