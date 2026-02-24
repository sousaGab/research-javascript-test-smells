it('should not remove anything due to case sensitivity', function () {
  const FIELD_NAME = 'name'
  const NON_MATCHING_NAME_DUE_TO_CASE = 'jonny'
  const EXPECTED_REMOVED_COUNT = 0
  const EXPECTED_LIST_LENGTH = 1

  const count = list.remove(FIELD_NAME, NON_MATCHING_NAME_DUE_TO_CASE)

  expect(count).toBe(EXPECTED_REMOVED_COUNT)
  expect(list.items.length).toEqual(EXPECTED_LIST_LENGTH)
})