it('should find four items when searching for "thre"', function () {
  const searchTerm = 'thre';
  const expectedMatchCount = 4;

  list.fuzzySearch(searchTerm);

  expect(list.matchingItems.length).toBe(expectedMatchCount);
});