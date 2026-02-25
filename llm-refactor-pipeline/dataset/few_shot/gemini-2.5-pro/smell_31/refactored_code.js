it('should find result', function () {
    const EXPECTED_MATCHING_ITEMS_COUNT = 4;
    list.fuzzySearch('thre')
    expect(list.matchingItems.length).toBe(EXPECTED_MATCHING_ITEMS_COUNT)
  })