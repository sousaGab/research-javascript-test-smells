const REMOVAL_COUNT_NONE = 0
const EXPECTED_ITEMS_LENGTH = 1

it('should not remove anything due to case sensitivity', function () {
  var count = list.remove('name', 'jonny')
  expect(count).toBe(REMOVAL_COUNT_NONE)
  expect(list.items.length).toEqual(EXPECTED_ITEMS_LENGTH)
})