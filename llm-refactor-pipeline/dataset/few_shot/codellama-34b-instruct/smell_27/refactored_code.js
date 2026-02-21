const EXPECTED_ITEMS_LENGTH = 2;
const EXPECTED_REMOVED_COUNT = 1;
const EXPECTED_ITEMS_LENGTH_AFTER_REMOVE = 1;

it('should remove one item', function () {
  list.add({ name: 'Jonas' })
  expect(list.items.length).toEqual(EXPECTED_ITEMS_LENGTH)
  var count = list.remove('name', 'Jonas')
  expect(count).toEqual(EXPECTED_REMOVED_COUNT)
  expect(list.items.length).toEqual(EXPECTED_ITEMS_LENGTH_AFTER_REMOVE)
})