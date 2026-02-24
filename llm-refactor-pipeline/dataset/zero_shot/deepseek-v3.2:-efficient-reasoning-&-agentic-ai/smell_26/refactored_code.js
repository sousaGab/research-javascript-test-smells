it('should remove eight items', function () {
  const itemsToAdd = [
    { name: 'Jonny' },
    { name: 'Jonny' },
    { name: 'Sven' },
    { name: 'Jonny' },
    { name: 'Jonny' },
    { name: 'Jonny' },
    { name: 'Jonas' },
    { name: 'Jonny' },
    { name: 'Jonny' }
  ];
  
  itemsToAdd.forEach(item => list.add(item));
  
  const initialItemCount = itemsToAdd.length;
  const jonnyItemsCount = itemsToAdd.filter(item => item.name === 'Jonny').length;
  const nonJonnyItemsCount = initialItemCount - jonnyItemsCount;
  
  expect(list.items.length).toEqual(initialItemCount);
  
  var count = list.remove('name', 'Jonny');
  
  expect(count).toEqual(jonnyItemsCount);
  expect(list.items.length).toEqual(nonJonnyItemsCount);
})