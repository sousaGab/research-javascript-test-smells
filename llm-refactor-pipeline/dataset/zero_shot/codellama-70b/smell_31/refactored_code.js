it('should find result', function () {
    const expectedMatchingItems = 4;
    list.fuzzySearch('thre');
    expect(list.matchingItems.length).toBe(expectedMatchingItems);
});