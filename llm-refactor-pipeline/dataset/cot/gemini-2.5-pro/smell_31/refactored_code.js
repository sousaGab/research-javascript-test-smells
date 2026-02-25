const EXPECTED_MATCH_COUNT = 4;

it('should find result', function () {
    list.fuzzySearch('thre');
    expect(list.matchingItems.length).toBe(EXPECTED_MATCH_COUNT);
});