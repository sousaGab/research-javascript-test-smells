it('should not remove anything due to case sensitivity', function () {
  const searchTerm = 'jonny';
  const expectedRemovalCount = 0;
  const expectedItemsLength = 1;
  
  var count = list.remove('name', searchTerm);
  expect(count).toBe(expectedRemovalCount);
  expect(list.items.length).toEqual(expectedItemsLength);
});