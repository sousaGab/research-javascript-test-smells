it('should remove one item', function () {
  const initialItemCount = list.items.length;
  const newItem = { name: 'Jonas' };
  const expectedItemsAdded = 1;
  const expectedItemsRemoved = 1;

  list.add(newItem);
  expect(list.items.length).toEqual(initialItemCount + expectedItemsAdded);

  const actualItemsRemoved = list.remove('name', newItem.name);
  expect(actualItemsRemoved).toEqual(expectedItemsRemoved);

  expect(list.items.length).toEqual(initialItemCount);
})