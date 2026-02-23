// Your COMPLETE refactored test code here

it('should find result', function () {
    const searchTerm = 'thre';
    const expectedMatchingItems = 4;
    
    list.fuzzySearch(searchTerm);
    expect(list.matchingItems.length).toBe(expectedMatchingItems);
  })