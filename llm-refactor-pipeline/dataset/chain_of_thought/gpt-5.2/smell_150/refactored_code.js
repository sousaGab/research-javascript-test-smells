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

  const expectPageItemClassOnAll = () => {
    getLis().forEach((li) => {
      expect(li.classes()).toContain('page-item')
    })
  }

  const expectDisabledState = ({ first, prev, next, last }) => {
    const lis = getLis()
    const expectDisabled = (li, shouldBeDisabled) => {
      if (shouldBeDisabled) {
        expect(li.classes()).toContain('disabled')
      } else {
        expect(li.classes()).not.toContain('disabled')
      }
    }
    expectDisabled(lis[0], first)
    expectDisabled(lis[1], prev)
    expectDisabled(lis[9], next)
    expectDisabled(lis[10], last)
  }

  const expectActivePageButtonAtIndex = (activeIndex) => {
    const lis = getLis()
    for (let i = 2; i <= 8; i++) {
      if (i === activeIndex) {
        expect(lis[i].classes()).toContain('active')
      } else {
        expect(lis[i].classes()).not.toContain('active')
      }
    }
  }

  const expectBvHiddenOnPageButtons = (hiddenIndices) => {
    const lis = getLis()
    for (let i = 2; i <= 8; i++) {
      if (hiddenIndices.includes(i)) {
        expect(lis[i].classes()).toContain('bv-d-xs-down-none')
      } else {
        expect(lis[i].classes()).not.toContain('bv-d-xs-down-none')
      }
    }
  }

  const expectState = ({
    computedCurrentPage,
    disabled,
    activeIndex,
    hiddenIndices
  }) => {
    expect(wrapper.vm.computedCurrentPage).toBe(computedCurrentPage)
    expectPageItemClassOnAll()
    expectDisabledState(disabled)
    expectActivePageButtonAtIndex(activeIndex)
    expectBvHiddenOnPageButtons(hiddenIndices)
  }

  expectBaseStructure()

  // currentPage = 1
  expectState({
    computedCurrentPage: 1,
    disabled: { first: true, prev: true, next: false, last: false },
    activeIndex: 2,
    hiddenIndices: [5, 6, 7, 8]
  })

  // currentPage = 4
  await wrapper.setProps({ value: '4' })
  await waitNT(wrapper.vm)
  expectState({
    computedCurrentPage: 4,
    disabled: { first: false, prev: false, next: false, last: false },
    activeIndex: 5,
    hiddenIndices: [2, 3, 7, 8]
  })

  // currentPage = 7
  await wrapper.setProps({ value: '7' })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(7)
  expectPageItemClassOnAll()
  // Page number buttons: pages 1-4 hidden, pages 5-7 visible
  expectBvHiddenOnPageButtons([2, 3, 4, 5])

  wrapper.destroy()
})