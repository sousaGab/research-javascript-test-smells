it('should contain two items', function () {
  const INITIAL_ITEM_COUNT = 0;
  const SECOND_ITEM = { name: 'Jonas' };
  const EXPECTED_ITEM_COUNT = 2;

  expect(list.items.length).toEqual(INITIAL_ITEM_COUNT);
  list.add(SECOND_ITEM);
  expect(list.items.length).toEqual(EXPECTED_ITEM_COUNT);
  expect(listEl.find('li').length).toEqual(EXPECTED_ITEM_COUNT);
});