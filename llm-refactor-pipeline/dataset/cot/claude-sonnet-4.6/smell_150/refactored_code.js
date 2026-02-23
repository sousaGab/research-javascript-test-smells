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

    const lisWrappers1 = wrapper.findAll('li').wrappers

    // First button (index 0)
    expect(lisWrappers1[0].classes()).toContain('page-item')
    expect(lisWrappers1[0].classes()).toContain('disabled')

    // Prev button (index 1)
    expect(lisWrappers1[1].classes()).toContain('page-item')
    expect(lisWrappers1[1].classes()).toContain('disabled')

    // Page number button index 2 (active)
    expect(lisWrappers1[2].classes()).toContain('page-item')
    expect(lisWrappers1[2].classes()).toContain('active')
    expect(lisWrappers1[2].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 3
    expect(lisWrappers1[3].classes()).toContain('page-item')
    expect(lisWrappers1[3].classes()).not.toContain('active')
    expect(lisWrappers1[3].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 4
    expect(lisWrappers1[4].classes()).toContain('page-item')
    expect(lisWrappers1[4].classes()).not.toContain('active')
    expect(lisWrappers1[4].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 5
    expect(lisWrappers1[5].classes()).toContain('page-item')
    expect(lisWrappers1[5].classes()).not.toContain('active')
    expect(lisWrappers1[5].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 6
    expect(lisWrappers1[6].classes()).toContain('page-item')
    expect(lisWrappers1[6].classes()).not.toContain('active')
    expect(lisWrappers1[6].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 7
    expect(lisWrappers1[7].classes()).toContain('page-item')
    expect(lisWrappers1[7].classes()).not.toContain('active')
    expect(lisWrappers1[7].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 8
    expect(lisWrappers1[8].classes()).toContain('page-item')
    expect(lisWrappers1[8].classes()).not.toContain('active')
    expect(lisWrappers1[8].classes()).toContain('bv-d-xs-down-none')

    // Next button (index 9)
    expect(lisWrappers1[9].classes()).toContain('page-item')
    expect(lisWrappers1[9].classes()).not.toContain('disabled')

    // Last button (index 10)
    expect(lisWrappers1[10].classes()).toContain('page-item')
    expect(lisWrappers1[10].classes()).not.toContain('disabled')

    // Should have the first and last 2 pages buttons with the
    // display classes when currentPage = 4
    await wrapper.setProps({
      value: '4'
    })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(4)

    const lisWrappers4 = wrapper.findAll('li').wrappers

    // First button (index 0)
    expect(lisWrappers4[0].classes()).toContain('page-item')
    expect(lisWrappers4[0].classes()).not.toContain('disabled')

    // Prev button (index 1)
    expect(lisWrappers4[1].classes()).toContain('page-item')
    expect(lisWrappers4[1].classes()).not.toContain('disabled')

    // Page number button index 2
    expect(lisWrappers4[2].classes()).toContain('page-item')
    expect(lisWrappers4[2].classes()).not.toContain('active')
    expect(lisWrappers4[2].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 3
    expect(lisWrappers4[3].classes()).toContain('page-item')
    expect(lisWrappers4[3].classes()).not.toContain('active')
    expect(lisWrappers4[3].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 4
    expect(lisWrappers4[4].classes()).toContain('page-item')
    expect(lisWrappers4[4].classes()).not.toContain('active')
    expect(lisWrappers4[4].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 5 (active)
    expect(lisWrappers4[5].classes()).toContain('page-item')
    expect(lisWrappers4[5].classes()).toContain('active')
    expect(lisWrappers4[5].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 6
    expect(lisWrappers4[6].classes()).toContain('page-item')
    expect(lisWrappers4[6].classes()).not.toContain('active')
    expect(lisWrappers4[6].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 7
    expect(lisWrappers4[7].classes()).toContain('page-item')
    expect(lisWrappers4[7].classes()).not.toContain('active')
    expect(lisWrappers4[7].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 8
    expect(lisWrappers4[8].classes()).toContain('page-item')
    expect(lisWrappers4[8].classes()).not.toContain('active')
    expect(lisWrappers4[8].classes()).toContain('bv-d-xs-down-none')

    // Next button (index 9)
    expect(lisWrappers4[9].classes()).toContain('page-item')
    expect(lisWrappers4[9].classes()).not.toContain('disabled')

    // Last button (index 10)
    expect(lisWrappers4[10].classes()).toContain('page-item')
    expect(lisWrappers4[10].classes()).not.toContain('disabled')

    // Should have the first 4 pages buttons with the
    // display classes when currentPage = 7
    await wrapper.setProps({
      value: '7'
    })
    await waitNT(wrapper.vm)
    expect(wrapper.vm.computedCurrentPage).toBe(7)

    const lisWrappers7 = wrapper.findAll('li').wrappers

    // First button (index 0)
    expect(lisWrappers7[0].classes()).toContain('page-item')

    // Prev button (index 1)
    expect(lisWrappers7[1].classes()).toContain('page-item')

    // Page number button index 2 (Pages 1) - bv-d-xs-down-none
    expect(lisWrappers7[2].classes()).toContain('page-item')
    expect(lisWrappers7[2].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 3 (Pages 2) - bv-d-xs-down-none
    expect(lisWrappers7[3].classes()).toContain('page-item')
    expect(lisWrappers7[3].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 4 (Pages 3) - bv-d-xs-down-none
    expect(lisWrappers7[4].classes()).toContain('page-item')
    expect(lisWrappers7[4].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 5 (Pages 4) - bv-d-xs-down-none
    expect(lisWrappers7[5].classes()).toContain('page-item')
    expect(lisWrappers7[5].classes()).toContain('bv-d-xs-down-none')

    // Page number button index 6 (Pages 5) - not bv-d-xs-down-none
    expect(lisWrappers7[6].classes()).toContain('page-item')
    expect(lisWrappers7[6].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 7 (Pages 6) - not bv-d-xs-down-none
    expect(lisWrappers7[7].classes()).toContain('page-item')
    expect(lisWrappers7[7].classes()).not.toContain('bv-d-xs-down-none')

    // Page number button index 8 (Pages 7) - not bv-d-xs-down-none
    expect(lisWrappers7[8].classes()).toContain('page-item')
    expect(lisWrappers7[8].classes()).not.toContain('bv-d-xs-down-none')

    // Next button (index 9)
    expect(lisWrappers7[9].classes()).toContain('page-item')

    // Last button (index 10)
    expect(lisWrappers7[10].classes()).toContain('page-item')

    wrapper.destroy()
  })