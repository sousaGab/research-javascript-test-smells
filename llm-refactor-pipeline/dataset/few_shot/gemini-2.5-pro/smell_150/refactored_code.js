it('renders classes correctly across different pages when more than 3 pages are available', async () => {
  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    }
  })
  expect(wrapper.element.tagName).toBe('UL')

  // --- State 1: Assertions for the first page ---
  expect(wrapper.vm.computedCurrentPage).toBe(1)
  let lis = wrapper.findAll('li').wrappers
  expect(lis).toHaveLength(11)

  // Bookend button states
  expect(lis[0].classes()).toContain('disabled') // First
  expect(lis[1].classes()).toContain('disabled') // Prev
  expect(lis[9].classes()).not.toContain('disabled') // Next
  expect(lis[10].classes()).not.toContain('disabled') // Last

  // Page button active states
  expect(lis[2].classes()).toContain('active') // Page 1
  expect(lis[3].classes()).not.toContain('active') // Page 2

  // Page button visibility states
  expect(lis[2].classes()).not.toContain('bv-d-xs-down-none') // Page 1
  expect(lis[3].classes()).not.toContain('bv-d-xs-down-none') // Page 2
  expect(lis[4].classes()).not.toContain('bv-d-xs-down-none') // Page 3
  expect(lis[5].classes()).toContain('bv-d-xs-down-none') // Page 4
  expect(lis[6].classes()).toContain('bv-d-xs-down-none') // Page 5
  expect(lis[7].classes()).toContain('bv-d-xs-down-none') // Page 6
  expect(lis[8].classes()).toContain('bv-d-xs-down-none') // Page 7

  // --- State 2: Assertions for a middle page ---
  await wrapper.setProps({
    value: 4
  })
  await waitNT(wrapper.vm)

  expect(wrapper.vm.computedCurrentPage).toBe(4)
  lis = wrapper.findAll('li').wrappers

  // Bookend button states
  expect(lis[0].classes()).not.toContain('disabled') // First
  expect(lis[1].classes()).not.toContain('disabled') // Prev
  expect(lis[9].classes()).not.toContain('disabled') // Next
  expect(lis[10].classes()).not.toContain('disabled') // Last

  // Page button active states
  expect(lis[4].classes()).not.toContain('active') // Page 3
  expect(lis[5].classes()).toContain('active') // Page 4
  expect(lis[6].classes()).not.toContain('active') // Page 5

  // Page button visibility states
  expect(lis[2].classes()).toContain('bv-d-xs-down-none') // Page 1
  expect(lis[3].classes()).toContain('bv-d-xs-down-none') // Page 2
  expect(lis[4].classes()).not.toContain('bv-d-xs-down-none') // Page 3
  expect(lis[5].classes()).not.toContain('bv-d-xs-down-none') // Page 4
  expect(lis[6].classes()).not.toContain('bv-d-xs-down-none') // Page 5
  expect(lis[7].classes()).toContain('bv-d-xs-down-none') // Page 6
  expect(lis[8].classes()).toContain('bv-d-xs-down-none') // Page 7

  // --- State 3: Assertions for the last page ---
  await wrapper.setProps({
    value: 7
  })
  await waitNT(wrapper.vm)

  expect(wrapper.vm.computedCurrentPage).toBe(7)
  lis = wrapper.findAll('li').wrappers

  // Bookend button states
  expect(lis[9].classes()).toContain('disabled') // Next
  expect(lis[10].classes()).toContain('disabled') // Last

  // Page button active states
  expect(lis[8].classes()).toContain('active') // Page 7

  // Page button visibility states
  expect(lis[2].classes()).toContain('bv-d-xs-down-none') // Page 1
  expect(lis[3].classes()).toContain('bv-d-xs-down-none') // Page 2
  expect(lis[4].classes()).toContain('bv-d-xs-down-none') // Page 3
  expect(lis[5].classes()).toContain('bv-d-xs-down-none') // Page 4
  expect(lis[6].classes()).not.toContain('bv-d-xs-down-none') // Page 5
  expect(lis[7].classes()).not.toContain('bv-d-xs-down-none') // Page 6
  expect(lis[8].classes()).not.toContain('bv-d-xs-down-none') // Page 7

  wrapper.destroy()
})