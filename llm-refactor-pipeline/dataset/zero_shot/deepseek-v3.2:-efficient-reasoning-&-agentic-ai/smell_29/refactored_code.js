it('should contain two items', function () {
  const EXPECTED_ITEM_COUNT = 2;
  
  list.add({ name: 'Jonas' });
  
  expect(list.items.length).toEqual(EXPECTED_ITEM_COUNT);
  expect(listEl.find('li').length).toEqual(EXPECTED_ITEM_COUNT);
});