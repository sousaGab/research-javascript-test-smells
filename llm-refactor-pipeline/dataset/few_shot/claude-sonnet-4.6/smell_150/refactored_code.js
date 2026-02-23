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
    // display classes when currentPage = 1
    expect(wrapper.vm.computedCurrentPage).toBe(1)

    const liWrappers1 = wrapper.findAll('li').wrappers

    // First button (index 0)
    expect(liWrappers1[0].classes()).toContain('page-item')
    expect(liWrappers1[0].classes()).toContain('disabled')

    // Prev button (index 1)
    expect(liWrappers1[1].classes()).toContain('page-item')
    expect(liWrappers1[1].classes()).toContain('disabled')

    // Page number button index 2 (active)
    expect(liWrappers1[2].classes()).toContain('page-item')
    expect(liWrappers1[2].classes()).toContain('active')
    expect(liWrappers1[2].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 3
    expect(liWrappers1[3].classes()).toContain('page-item')
    expect(liWrappers1[3].classes()).not.toContain('active')
    expect(liWrappers1[3].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 4
    expect(liWrappers1[4].classes()).toContain('page-item')
    expect(liWrappers1[4].classes()).not.toContain('active')
    expect(liWrappers1[4].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 5
    expect(liWrappers1[5].classes()).toContain('page-item')
    expect(liWrappers1[5].classes()).not.toContain('active')
    expect(liWrappers1[5].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 6
    expect(liWrappers1[6].classes()).toContain('page-item')
    expect(liWrappers1[6].classes()).not.toContain('active')
    expect(liWrappers1[6].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 7
    expect(liWrappers1[7].classes()).toContain('page-item')
    expect(liWrappers1[7].classes()).not.toContain('active')
    expect(liWrappers1[7].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 8
    expect(liWrappers1[8].classes()).toContain('page-item')
    expect(liWrappers1[8].classes()).not.toContain('active')
    expect(liWrappers1[8].classes()).toContain('bv-d-xs-down-none')

    // Next button (index 9)
    expect(liWrappers1[9].classes()).toContain('page-item')
    expect(liWrappers1[9].classes()).not.toContain('disabled')

    // Last button (index 10)
    expect(liWrappers1[10].classes()).toContain('page-item')
    expect(liWrappers1[10].classes()).not.toContain('disabled')

    // Should have the first and last 2 pages buttons with the
    // display classes when currentPage = 4
    await wrapper.setProps({
      value: '4'
    })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(4)

    const liWrappers4 = wrapper.findAll('li').wrappers

    // First button (index 0)
    expect(liWrappers4[0].classes()).toContain('page-item')
    expect(liWrappers4[0].classes()).not.toContain('disabled')

    // Prev button (index 1)
    expect(liWrappers4[1].classes()).toContain('page-item')
    expect(liWrappers4[1].classes()).not.toContain('disabled')

    // Page number button index 2
    expect(liWrappers4[2].classes()).toContain('page-item')
    expect(liWrappers4[2].classes()).not.toContain('active')
    expect(liWrappers4[2].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 3
    expect(liWrappers4[3].classes()).toContain('page-item')
    expect(liWrappers4[3].classes()).not.toContain('active')
    expect(liWrappers4[3].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 4
    expect(liWrappers4[4].classes()).toContain('page-item')
    expect(liWrappers4[4].classes()).not.toContain('active')
    expect(liWrappers4[4].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 5 (active)
    expect(liWrappers4[5].classes()).toContain('page-item')
    expect(liWrappers4[5].classes()).toContain('active')
    expect(liWrappers4[5].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 6
    expect(liWrappers4[6].classes()).toContain('page-item')
    expect(liWrappers4[6].classes()).not.toContain('active')
    expect(liWrappers4[6].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 7
    expect(liWrappers4[7].classes()).toContain('page-item')
    expect(liWrappers4[7].classes()).not.toContain('active')
    expect(liWrappers4[7].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 8
    expect(liWrappers4[8].classes()).toContain('page-item')
    expect(liWrappers4[8].classes()).not.toContain('active')
    expect(liWrappers4[8].classes()).toContain('bv-d-xs-down-none')

    // Next button (index 9)
    expect(liWrappers4[9].classes()).toContain('page-item')
    expect(liWrappers4[9].classes()).not.toContain('disabled')

    // Last button (index 10)
    expect(liWrappers4[10].classes()).toContain('page-item')
    expect(liWrappers4[10].classes()).not.toContain('disabled')

    // Should have the first 4 pages buttons with the
    // display classes when currentPage = 7
    await wrapper.setProps({
      value: '7'
    })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(7)

    const liWrappers7 = wrapper.findAll('li').wrappers

    // Page number button index 2 (page 1)
    expect(liWrappers7[2].classes()).toContain('page-item')
    expect(liWrappers7[2].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 3 (page 2)
    expect(liWrappers7[3].classes()).toContain('page-item')
    expect(liWrappers7[3].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 4 (page 3)
    expect(liWrappers7[4].classes()).toContain('page-item')
    expect(liWrappers7[4].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 5 (page 4)
    expect(liWrappers7[5].classes()).toContain('page-item')
    expect(liWrappers7[5].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 6 (page 5)
    expect(liWrappers7[6].classes()).toContain('page-item')
    expect(liWrappers7[6].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 7 (page 6)
    expect(liWrappers7[7].classes()).toContain('page-item')
    expect(liWrappers7[7].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 8 (page 7)
    expect(liWrappers7[8].classes()).toContain('page-item')
    expect(liWrappers7[8].classes()).not.toContain('bv-d-xs-down-none')

    wrapper.destroy()
  })