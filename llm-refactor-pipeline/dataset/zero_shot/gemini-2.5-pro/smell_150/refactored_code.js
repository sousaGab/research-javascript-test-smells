it('renders classes bv-d-xs-down-none when more than 3 pages', async () => {
  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    }
  })

  const getLiClasses = (w) => w.findAll('li').wrappers.map(li => li.classes().sort());
  const sortAll = (classes) => classes.map(c => c.sort());

  // --- State 1: Current Page = 1 ---
  expect(wrapper.element.tagName).toBe('UL')
  expect(wrapper.findAll('li').length).toBe(11)
  expect(wrapper.vm.computedCurrentPage).toBe(1)

  let expectedClasses = [
    ['page-item', 'disabled'], // First
    ['page-item', 'disabled'], // Prev
    ['page-item', 'active'], // Page 1
    ['page-item'], // Page 2
    ['page-item'], // Page 3
    ['page-item', 'bv-d-xs-down-none'], // Page 4
    ['page-item', 'bv-d-xs-down-none'], // Page 5
    ['page-item', 'bv-d-xs-down-none'], // Page 6
    ['page-item', 'bv-d-xs-down-none'], // Page 7
    ['page-item'], // Next
    ['page-item'] // Last
  ];
  expect(getLiClasses(wrapper)).toEqual(sortAll(expectedClasses));

  // --- State 2: Current Page = 4 ---
  await wrapper.setProps({
    value: '4'
  })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(4)

  expectedClasses = [
    ['page-item'], // First
    ['page-item'], // Prev
    ['page-item', 'bv-d-xs-down-none'], // Page 1
    ['page-item', 'bv-d-xs-down-none'], // Page 2
    ['page-item'], // Page 3
    ['page-item', 'active'], // Page 4
    ['page-item'], // Page 5
    ['page-item', 'bv-d-xs-down-none'], // Page 6
    ['page-item', 'bv-d-xs-down-none'], // Page 7
    ['page-item'], // Next
    ['page-item'] // Last
  ];
  expect(getLiClasses(wrapper)).toEqual(sortAll(expectedClasses));

  // --- State 3: Current Page = 7 ---
  await wrapper.setProps({
    value: '7'
  })
  await waitNT(wrapper.vm)
  expect(wrapper.vm.computedCurrentPage).toBe(7)

  expectedClasses = [
    ['page-item'], // First
    ['page-item'], // Prev
    ['page-item', 'bv-d-xs-down-none'], // Page 1
    ['page-item', 'bv-d-xs-down-none'], // Page 2
    ['page-item', 'bv-d-xs-down-none'], // Page 3
    ['page-item', 'bv-d-xs-down-none'], // Page 4
    ['page-item'], // Page 5
    ['page-item'], // Page 6
    ['page-item', 'active'], // Page 7
    ['page-item', 'disabled'], // Next
    ['page-item', 'disabled'] // Last
  ];
  expect(getLiClasses(wrapper)).toEqual(sortAll(expectedClasses));

  wrapper.destroy()
})