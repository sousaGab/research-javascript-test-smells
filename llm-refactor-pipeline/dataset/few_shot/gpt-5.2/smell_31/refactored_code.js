it('should find result', function () {
  const SEARCH_TERM = 'thre'
  const EXPECTED_MATCH_COUNT = 4

  list.fuzzySearch(SEARCH_TERM)
  expect(list.matchingItems.length).toBe(EXPECTED_MATCH_COUNT)
})