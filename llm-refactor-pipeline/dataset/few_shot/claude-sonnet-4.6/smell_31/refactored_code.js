const SEARCH_QUERY = 'thre';
const EXPECTED_MATCH_COUNT = 4;

it('should find result', function () {
  list.fuzzySearch(SEARCH_QUERY);
  expect(list.matchingItems.length).toBe(EXPECTED_MATCH_COUNT);
});