it('should find result', function () {
    const expectedMatchCount = 4;
    list.fuzzySearch('thre');
    expect(list.matchingItems.length).toBe(expectedMatchCount);
});