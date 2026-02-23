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

  const expectPageItem = (li) => {
    expect(li.classes()).toContain('page-item')
  }

  const expectDisabled = (li, disabled) => {
    if (disabled) {
      expect(li.classes()).toContain('disabled')
    } else {
      expect(li.classes()).not.toContain('disabled')
    }
  }

  const expectActive = (li, active) => {
    if (active) {
      expect(li.classes()).toContain('active')
    } else {
      expect(li.classes()).not.toContain('active')
    }
  }

  const expectHiddenXsDown = (li, hidden) => {
    if (hidden) {
      expect(li.classes()).toContain('bv-d-xs-down-none')
    } else {
      expect(li.classes()).not.toContain('bv-d-xs-down-none')
    }
  }

  const expectState = ({
    currentPage,
    disabledIndices = [],
    enabledIndices = [],
    activeIndex,
    hiddenIndices = [],
    visibleIndices = []
  }) => {
    expect(wrapper.vm.computedCurrentPage).toBe(currentPage)

    const lis = getLis()
    lis.forEach((li, index) => {
      expectPageItem(li)

      if (disabledIndices.includes(index)) {
        expectDisabled(li, true)
      }
      if (enabledIndices.includes(index)) {
        expectDisabled(li, false)
      }

      if (typeof activeIndex === 'number') {
        expectActive(li, index === activeIndex)
      }

      if (hiddenIndices.includes(index)) {
        expectHiddenXsDown(li, true)
      }
      if (visibleIndices.includes(index)) {
        expectHiddenXsDown(li, false)
      }
    })
  }

  expect(wrapper.element.tagName).toBe('UL')
  const initialLis = wrapper.findAll('li')
  expect(initialLis).toBeDefined()
  expect(initialLis.length).toBe(11)

  expectState({
    currentPage: 1,
    disabledIndices: [0, 1],
    enabledIndices: [9, 10],
    activeIndex: 2,
    visibleIndices: [2, 3, 4],
    hiddenIndices: [5, 6, 7, 8]
  })

  await wrapper.setProps({ value: '4' })
  await waitNT(wrapper.vm)

  expectState({
    currentPage: 4,
    enabledIndices: [0, 1, 9, 10],
    activeIndex: 5,
    visibleIndices: [4, 5, 6],
    hiddenIndices: [2, 3, 7, 8]
  })

  await wrapper.setProps({ value: '7' })
  await waitNT(wrapper.vm)

  expect(wrapper.vm.computedCurrentPage).toBe(7)
  getLis().forEach((li, index) => {
    expectPageItem(li)
    if (index >= 2 && index <= 5) {
      expectHiddenXsDown(li, true)
    } else if (index >= 6 && index <= 8) {
      expectHiddenXsDown(li, false)
    }
  })

  wrapper.destroy()
})