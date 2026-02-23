it('renders classes bv-d-xs-down-none when more than 3 pages', async () => {
  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    }
  })

  const getLis = () => wrapper.findAll('li').wrappers

  const expectBaseStructure = () => {
    expect(wrapper.element.tagName).toBe('UL')
    const lis = wrapper.findAll('li')
    expect(lis).toBeDefined()
    // Including bookend buttons
    expect(lis.length).toBe(11)
  }

  const expectAllPageItems = (lis) => {
    lis.forEach((li) => {
      expect(li.classes()).toContain('page-item')
    })
  }

  const expectDisabledStateByIndex = (lis, disabledIndexes = [], enabledIndexes = []) => {
    disabledIndexes.forEach((i) => {
      expect(lis[i].classes()).toContain('disabled')
    })
    enabledIndexes.forEach((i) => {
      expect(lis[i].classes()).not.toContain('disabled')
    })
  }

  const expectActiveIndex = (lis, activeIndex) => {
    lis.forEach((li, index) => {
      if (index === activeIndex) {
        expect(li.classes()).toContain('active')
      } else {
        expect(li.classes()).not.toContain('active')
      }
    })
  }

  const expectBvHiddenIndexes = (lis, hiddenIndexes = [], visibleIndexes = []) => {
    hiddenIndexes.forEach((i) => {
      expect(lis[i].classes()).toContain('bv-d-xs-down-none')
    })
    visibleIndexes.forEach((i) => {
      expect(lis[i].classes()).not.toContain('bv-d-xs-down-none')
    })
  }

  const range = (start, end) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const setPageAndWait = async (value) => {
    await wrapper.setProps({ value })
    await waitNT(wrapper.vm)
  }

  expectBaseStructure()

  // Should have the last 4 page buttons with the display classes when currentPage = 1
  expect(wrapper.vm.computedCurrentPage).toBe(1)
  {
    const lis = getLis()
    expectAllPageItems(lis)

    // Bookend buttons: First, Prev disabled; Next, Last enabled
    expectDisabledStateByIndex(lis, [0, 1], [9, 10])

    // Page number buttons: active at index 2, others not active
    expectActiveIndex(lis, 2)

    // Page number buttons: indexes 2-4 visible, 5-8 hidden
    expectBvHiddenIndexes(lis, range(5, 8), range(2, 4))
  }

  // Should have the first and last 2 pages buttons with the display classes when currentPage = 4
  await setPageAndWait('4')
  expect(wrapper.vm.computedCurrentPage).toBe(4)
  {
    const lis = getLis()
    expectAllPageItems(lis)

    // Bookend buttons: all enabled
    expectDisabledStateByIndex(lis, [], [0, 1, 9, 10])

    // Page number buttons: active at index 5, others not active
    expectActiveIndex(lis, 5)

    // Page number buttons: indexes 4-6 visible, 2-3 and 7-8 hidden
    expectBvHiddenIndexes(lis, [...range(2, 3), ...range(7, 8)], range(4, 6))
  }

  // Should have the first 4 pages buttons with the display classes when currentPage = 7
  await setPageAndWait('7')
  expect(wrapper.vm.computedCurrentPage).toBe(7)
  {
    const lis = getLis()
    expectAllPageItems(lis)

    // Page number buttons: Pages 1 to 4 (indexes 2-5) hidden; Pages 5 to 7 (indexes 6-8) visible
    expectBvHiddenIndexes(lis, range(2, 5), range(6, 8))
  }

  wrapper.destroy()
})