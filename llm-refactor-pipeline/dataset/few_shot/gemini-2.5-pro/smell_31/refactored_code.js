it('should find 4 items for the search term "thre"', function () {
    const EXPECTED_MATCH_COUNT = 4;
    list.fuzzySearch('thre');
    expect(list.matchingItems.length).toBe(EXPECTED_MATCH_COUNT);
});