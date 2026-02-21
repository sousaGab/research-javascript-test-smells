it('should not remove anything due to case sensitivity', function () {
  const EXPECTED_REMOVAL_COUNT = 0;
  const EXPECTED_ITEMS_LENGTH = 1;
  const ITEM_NAME = 'jonny';

  var count = list.remove('name', ITEM_NAME);
  expect(count).toBe(EXPECTED_REMOVAL_COUNT);
  expect(list.items.length).toEqual(EXPECTED_ITEMS_LENGTH);
})