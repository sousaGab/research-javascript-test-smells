it('updates button states and responsive visibility when the page changes', async () => {
  const wrapper = mount(BPagination, {
    propsData: {
      totalRows: 70,
      perPage: 10,
      limit: 7,
      value: 1
    }
  });

  const getLiWrappers = () => wrapper.findAll('li').wrappers;

  // State when on the first page
  expect(wrapper.vm.computedCurrentPage).toBe(1);
  let listItems = getLiWrappers();
  expect(listItems[0].classes()).toContain('disabled'); // First button
  expect(listItems[1].classes()).toContain('disabled'); // Prev button
  expect(listItems[9].classes()).not.toContain('disabled'); // Next button
  expect(listItems[10].classes()).not.toContain('disabled'); // Last button

  let pageButtons = listItems.slice(2, 9);
  expect(pageButtons[0].classes()).toContain('active');
  expect(pageButtons.slice(1).every(btn => !btn.classes().includes('active'))).toBe(true);

  let visibilityClasses = pageButtons.map(btn => btn.classes().includes('bv-d-xs-down-none'));
  expect(visibilityClasses).toEqual([false, false, false, true, true, true, true]);

  // State when on a middle page
  await wrapper.setProps({
    value: '4'
  });
  await waitNT(wrapper.vm);

  expect(wrapper.vm.computedCurrentPage).toBe(4);
  listItems = getLiWrappers();
  expect(listItems[0].classes()).not.toContain('disabled');
  expect(listItems[1].classes()).not.toContain('disabled');
  expect(listItems[9].classes()).not.toContain('disabled');
  expect(listItems[10].classes()).not.toContain('disabled');

  pageButtons = listItems.slice(2, 9);
  expect(pageButtons[3].classes()).toContain('active');
  expect(pageButtons.filter((_, i) => i !== 3).every(btn => !btn.classes().includes('active'))).toBe(true);

  visibilityClasses = pageButtons.map(btn => btn.classes().includes('bv-d-xs-down-none'));
  expect(visibilityClasses).toEqual([true, true, false, false, false, true, true]);

  // State when on the last page
  await wrapper.setProps({
    value: '7'
  });
  await waitNT(wrapper.vm);

  expect(wrapper.vm.computedCurrentPage).toBe(7);
  pageButtons = getLiWrappers().slice(2, 9);
  visibilityClasses = pageButtons.map(btn => btn.classes().includes('bv-d-xs-down-none'));
  expect(visibilityClasses).toEqual([true, true, true, true, false, false, false]);

  wrapper.destroy();
});