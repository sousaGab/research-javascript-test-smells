it('should remove all items matching a property value and return the count of removed items', function () {
  const nameToRemove = 'Jonny';
  const itemsToAdd = [
    { name: 'Jonny' },
    { name: 'Jonny' },
    { name: 'Sven' },
    { name: 'Jonny' },
    { name: 'Jonny' },
    { name: 'Jonny' },
    { name: 'Jonas' },
    { name: 'Jonny' },
    { name: 'Jonny' },
    { name: 'Jonny' }
  ];

  const initialCount = itemsToAdd.length;
  const expectedRemovedCount = itemsToAdd.filter(item => item.name === nameToRemove).length;
  const expectedRemainingCount = initialCount - expectedRemovedCount;

  itemsToAdd.forEach(item => list.add(item));

  expect(list.items.length).toEqual(initialCount);

  const actualRemovedCount = list.remove('name', nameToRemove);

  expect(actualRemovedCount).toEqual(expectedRemovedCount);
  expect(list.items.length).toEqual(expectedRemainingCount);
});