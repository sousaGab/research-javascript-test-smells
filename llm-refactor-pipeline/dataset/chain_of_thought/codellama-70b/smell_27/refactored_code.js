it('should remove one item', function () {
  const EXPECTED_ITEMS_LENGTH_AFTER_ADD = 2;
  const EXPECTED_ITEMS_LENGTH_AFTER_REMOVE = 1;
  const EXPECTED_REMOVED_COUNT = 1;

  list.add({ name: 'Jonas' });
  expect(list.items.length).toEqual(EXPECTED_ITEMS_LENGTH_AFTER_ADD);
  const count = list.remove('name', 'Jonas');
  expect(count).toEqual(EXPECTED_REMOVED_COUNT);
  expect(list.items.length).toEqual(EXPECTED_ITEMS_LENGTH_AFTER_REMOVE);
});