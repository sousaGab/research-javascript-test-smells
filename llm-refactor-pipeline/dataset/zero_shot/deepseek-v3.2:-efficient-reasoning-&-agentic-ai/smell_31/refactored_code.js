it('should find result', function () {
  const searchQuery = 'thre';
  const expectedMatchCount = 4;

  list.fuzzySearch(searchQuery);
  expect(list.matchingItems.length).toBe(expectedMatchCount);
})