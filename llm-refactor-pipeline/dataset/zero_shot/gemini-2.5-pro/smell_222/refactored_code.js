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
  expect(wrapper.findAll('li').length).toBe(11)

  // --- State 1: Current Page = 1 ---
  expect(wrapper.vm.computedCurrentPage).toBe(1)

  let listItems = wrapper.findAll('li')
  let pageButtons = listItems.wrappers.slice(2, 9)

  expect(listItems.at(0).classes()).toContain('disabled') // First button
  expect(listItems.at(1).classes()).toContain('disabled') // Prev button
  expect(listItems.at(9).classes()).not.toContain('disabled') // Next button
  expect(listItems.at(10).classes()).not.toContain('disabled') // Last button

  let activeStates = pageButtons.map(p => p.classes().includes('active'))
  expect(activeStates).toEqual([true, false, false, false, false, false, false])

  let visibilityStates = pageButtons.map(p => p.classes().includes('bv-d-xs-down-none'))
  expect(visibilityStates).toEqual([false, false, false, true, true, true, true])

  // --- State 2: Current Page = 4 ---
  await wrapper.setProps({
    value: 4
  })
  await waitNT(wrapper.vm)

  expect(wrapper.vm.computedCurrentPage).toBe(4)
  listItems = wrapper.findAll('li')
  pageButtons = listItems.wrappers.slice(2, 9)

  expect(listItems.at(0).classes()).not.toContain('disabled')
  expect(listItems.at(1).classes()).not.toContain('disabled')
  expect(listItems.at(9).classes()).not.toContain('disabled')
  expect(listItems.at(10).classes()).not.toContain('disabled')

  activeStates = pageButtons.map(p => p.classes().includes('active'))
  expect(activeStates).toEqual([false, false, false, true, false, false, false])

  visibilityStates = pageButtons.map(p => p.classes().includes('bv-d-xs-down-none'))
  expect(visibilityStates).toEqual([true, true, false, false, false, true, true])

  // --- State 3: Current Page = 7 ---
  await wrapper.setProps({
    value: 7
  })
  await waitNT(wrapper.vm)

  expect(wrapper.vm.computedCurrentPage).toBe(7)
  listItems = wrapper.findAll('li')
  pageButtons = listItems.wrappers.slice(2, 9)

  expect(listItems.at(0).classes()).not.toContain('disabled')
  expect(listItems.at(1).classes()).not.toContain('disabled')
  expect(listItems.at(9).classes()).toContain('disabled')
  expect(listItems.at(10).classes()).toContain('disabled')

  activeStates = pageButtons.map(p => p.classes().includes('active'))
  expect(activeStates).toEqual([false, false, false, false, false, false, true])

  visibilityStates = pageButtons.map(p => p.classes().includes('bv-d-xs-down-none'))
  expect(visibilityStates).toEqual([true, true, true, true, false, false, false])

  wrapper.destroy()
})