it('renders classes correctly based on the current page when limit is active', async () => {
  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    }
  })

  const assertPaginationState = (
    wrapperInstance, {
      currentPage,
      bookendDisabled,
      pageActive,
      pageHidden
    }
  ) => {
    const lis = wrapperInstance.findAll('li')
    expect(wrapperInstance.vm.computedCurrentPage).toBe(currentPage)

    const bookendButtons = [lis.at(0), lis.at(1), lis.at(9), lis.at(10)]
    if (bookendDisabled) {
      bookendButtons.forEach((button, i) => {
        expect(button.classes('disabled')).toBe(bookendDisabled[i])
      })
    }

    const pageButtons = lis.wrappers.slice(2, 9)
    pageButtons.forEach((button, i) => {
      if (pageActive) {
        expect(button.classes('active')).toBe(pageActive[i])
      }
      if (pageHidden) {
        expect(button.classes('bv-d-xs-down-none')).toBe(pageHidden[i])
      }
    })
  }

  expect(wrapper.element.tagName).toBe('UL')
  expect(wrapper.findAll('li').length).toBe(11)

  assertPaginationState(wrapper, {
    currentPage: 1,
    bookendDisabled: [true, true, false, false],
    pageActive: [true, false, false, false, false, false, false],
    pageHidden: [false, false, false, true, true, true, true]
  })

  await wrapper.setProps({
    value: '4'
  })
  await waitNT(wrapper.vm)

  assertPaginationState(wrapper, {
    currentPage: 4,
    bookendDisabled: [false, false, false, false],
    pageActive: [false, false, false, true, false, false, false],
    pageHidden: [true, true, false, false, false, true, true]
  })

  await wrapper.setProps({
    value: '7'
  })
  await waitNT(wrapper.vm)

  assertPaginationState(wrapper, {
    currentPage: 7,
    pageHidden: [true, true, true, true, false, false, false]
  })

  wrapper.destroy()
})