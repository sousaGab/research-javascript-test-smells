it('should remove one item', function () {
  const initialItemCount = list.items.length;
  const itemsToAdd = 1;
  const expectedRemovedCount = 1;
  
  list.add({ name: 'Jonas' });
  expect(list.items.length).toEqual(initialItemCount + itemsToAdd);
  
  var count = list.remove('name', 'Jonas');
  expect(count).toEqual(expectedRemovedCount);
  expect(list.items.length).toEqual(initialItemCount);
})