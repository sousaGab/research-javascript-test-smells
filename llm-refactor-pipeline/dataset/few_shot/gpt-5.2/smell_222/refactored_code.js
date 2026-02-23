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
  const expectPageItem = (li) => expect(li.classes()).toContain('page-item')
  const expectDisabled = (li, disabled = true) =>
    disabled
      ? expect(li.classes()).toContain('disabled')
      : expect(li.classes()).not.toContain('disabled')
  const expectActive = (li, active = true) =>
    active
      ? expect(li.classes()).toContain('active')
      : expect(li.classes()).not.toContain('active')
  const expectHiddenXsDown = (li, hidden = true) =>
    hidden
      ? expect(li.classes()).toContain('bv-d-xs-down-none')
      : expect(li.classes()).not.toContain('bv-d-xs-down-none')

  const expectBookends = (lis, { firstDisabled, prevDisabled, nextDisabled, lastDisabled }) => {
    expectDisabled(lis[0], firstDisabled)
    expectDisabled(lis[1], prevDisabled)
    expectDisabled(lis[9], nextDisabled)
    expectDisabled(lis[10], lastDisabled)
  }

  const expectAllPageItems = (lis) => lis.forEach(expectPageItem)

  expect(wrapper.element.tagName).toBe('UL')
  expect(wrapper.findAll('li')).toBeDefined()

  const lisInitial = getLis()
  expect(lisInitial.length).toBe(11)
  expect(wrapper.vm.computedCurrentPage).toBe(1)
  expectAllPageItems(lisInitial)
  expectBookends(lisInitial, {
    firstDisabled: true,
    prevDisabled: true,
    nextDisabled: false,
    lastDisabled: false
  })

  lisInitial.forEach((li, index) => {
    if (index < 2 || index > 8) return
    expectActive(li, index === 2)
    expectHiddenXsDown(li, index > 4)
  })

  await wrapper.setProps({ value: '4' })
  await waitNT(wrapper.vm)

  const lisPage4 = getLis()
  expect(wrapper.vm.computedCurrentPage).toBe(4)
  expectAllPageItems(lisPage4)
  expectBookends(lisPage4, {
    firstDisabled: false,
    prevDisabled: false,
    nextDisabled: false,
    lastDisabled: false
  })

  lisPage4.forEach((li, index) => {
    if (index < 2 || index > 8) return
    expectActive(li, index === 5)
    expectHiddenXsDown(li, !(index > 3 && index < 7))
  })

  await wrapper.setProps({ value: '7' })
  await waitNT(wrapper.vm)

  const lisPage7 = getLis()
  expect(wrapper.vm.computedCurrentPage).toBe(7)
  expectAllPageItems(lisPage7)

  lisPage7.forEach((li, index) => {
    if (index >= 2 && index <= 5) {
      expectHiddenXsDown(li, true)
    } else if (index >= 6 && index <= 8) {
      expectHiddenXsDown(li, false)
    }
  })

  wrapper.destroy()
})