const SEARCH_TERM = 'thre'
const EXPECTED_MATCHING_ITEMS_COUNT = 4

it('should find result', function () {
  list.fuzzySearch(SEARCH_TERM)
  expect(list.matchingItems.length).toBe(EXPECTED_MATCHING_ITEMS_COUNT)
})