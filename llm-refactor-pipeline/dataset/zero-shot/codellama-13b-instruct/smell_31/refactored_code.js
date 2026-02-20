it('should find result', function () {
    list.fuzzySearch('thre')
    expect(list.matchingItems.length).toBe(list.fuzzySearch('thre').length)
  })