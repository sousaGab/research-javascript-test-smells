const SEARCH_QUERY = 'thre';
const EXPECTED_MATCHING_ITEMS_COUNT = 4;

it('should find result', function () {
  list.fuzzySearch(SEARCH_QUERY);
  expect(list.matchingItems.length).toBe(EXPECTED_MATCHING_ITEMS_COUNT);
});