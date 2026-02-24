it('should not remove anything due to case sensitivity', function () {
  var NON_MATCHING_NAME = 'jonny'
  var EXPECTED_REMOVED_COUNT = 0
  var EXPECTED_LIST_LENGTH = 1

  var count = list.remove('name', NON_MATCHING_NAME)

  expect(count).toBe(EXPECTED_REMOVED_COUNT)
  expect(list.items.length).toEqual(EXPECTED_LIST_LENGTH)
})