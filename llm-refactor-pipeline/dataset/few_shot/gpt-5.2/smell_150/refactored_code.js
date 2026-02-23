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

  const expectPageItemClassOnAll = (lis) => {
    lis.forEach((li) => {
      expect(li.classes()).toContain('page-item')
    })
  }

  const expectDisabledStateByIndex = (lis, disabledIndexes = [], enabledIndexes = []) => {
    disabledIndexes.forEach((index) => {
      expect(lis[index].classes()).toContain('disabled')
    })
    enabledIndexes.forEach((index) => {
      expect(lis[index].classes()).not.toContain('disabled')
    })
  }

  const expectActiveIndex = (lis, activeIndex, pageButtonIndexes) => {
    pageButtonIndexes.forEach((index) => {
      if (index === activeIndex) {
        expect(lis[index].classes()).toContain('active')
      } else {
        expect(lis[index].classes()).not.toContain('active')
      }
    })
  }

  const expectBvHiddenByIndex = (lis, hiddenIndexes = [], visibleIndexes = []) => {
    hiddenIndexes.forEach((index) => {
      expect(lis[index].classes()).toContain('bv-d-xs-down-none')
    })
    visibleIndexes.forEach((index) => {
      expect(lis[index].classes()).not.toContain('bv-d-xs-down-none')
    })
  }

  const pageButtonIndexes = [2, 3, 4, 5, 6, 7, 8]

  expectBaseStructure()

  // currentPage = 1
  expect(wrapper.vm.computedCurrentPage).toBe(1)
  {
    const lis = getLis()
    expectPageItemClassOnAll(lis)

    // Bookends
    expectDisabledStateByIndex(
      lis,
      /* disabled */ [0, 1],
      /* enabled */ [9, 10]
    )

    // Page number buttons
    expectActiveIndex(lis, /* activeIndex */ 2, pageButtonIndexes)
    expectBvHiddenByIndex(
      lis,
      /* hidden */ [5, 6, 7, 8],
      /* visible */ [2, 3, 4]
    )
  }

  // currentPage = 4
  await wrapper.setProps({ value: '4' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(4)
  {
    const lis = getLis()
    expectPageItemClassOnAll(lis)

    // Bookends
    expectDisabledStateByIndex(
      lis,
      /* disabled */ [],
      /* enabled */ [0, 1, 9, 10]
    )

    // Page number buttons
    expectActiveIndex(lis, /* activeIndex */ 5, pageButtonIndexes)
    expectBvHiddenByIndex(
      lis,
      /* hidden */ [2, 3, 4, 8],
      /* visible */ [5, 6, 7]
    )
  }

  // currentPage = 7
  await wrapper.setProps({ value: '7' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(7)
  {
    const lis = getLis()
    expectPageItemClassOnAll(lis)

    // Page number buttons visibility (no active/disabled assertions in original block)
    expectBvHiddenByIndex(
      lis,
      /* hidden */ [2, 3, 4, 5],
      /* visible */ [6, 7, 8]
    )
  }

  wrapper.destroy()
})