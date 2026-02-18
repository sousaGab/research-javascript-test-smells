const REMOVED_ITEMS_COUNT = 0;
const EXPECTED_LIST_LENGTH = 1;

it('should not remove anything due to case sensitivity', function () {
  var count = list.remove('name', 'jonny')
  expect(count).toBe(REMOVED_ITEMS_COUNT)
  expect(list.items.length).toEqual(EXPECTED_LIST_LENGTH)
})