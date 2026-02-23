it('should find all items matching the fuzzy search term', function () {
    const searchTerm = 'thre';
    const expectedMatches = [
      'three',
      'thirteen',
      'thirty',
      'thirty-three'
    ];

    list.fuzzySearch(searchTerm);

    expect(list.matchingItems.length).toBe(expectedMatches.length);
});