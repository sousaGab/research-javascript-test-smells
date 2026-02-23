it('should remove one item', function () {
  const ITEM_TO_ADD = { name: 'Jonas' };
  const FIELD_NAME = 'name';
  const FIELD_VALUE = 'Jonas';

  const INITIAL_ITEMS_COUNT_AFTER_ADD = 2;
  const EXPECTED_REMOVED_COUNT = 1;
  const EXPECTED_ITEMS_COUNT_AFTER_REMOVE = 1;

  list.add(ITEM_TO_ADD);
  expect(list.items.length).toEqual(INITIAL_ITEMS_COUNT_AFTER_ADD);

  var count = list.remove(FIELD_NAME, FIELD_VALUE);
  expect(count).toEqual(EXPECTED_REMOVED_COUNT);
  expect(list.items.length).toEqual(EXPECTED_ITEMS_COUNT_AFTER_REMOVE);
});