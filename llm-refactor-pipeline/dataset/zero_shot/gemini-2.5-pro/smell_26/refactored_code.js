it('should return the count of removed items and update the list', function () {
  const itemsToAdd = [
    { name: 'Jonny' }, { name: 'Jonny' }, { name: 'Sven' },
    { name: 'Jonny' }, { name: 'Jonny' }, { name: 'Jonny' },
    { name: 'Jonas' }, { name: 'Jonny' }, { name: 'Jonny' },
    { name: 'Jonny' }
  ];
  const NAME_TO_REMOVE = 'Jonny';
  const PROPERTY_TO_MATCH = 'name';

  const INITIAL_ITEMS_COUNT = itemsToAdd.length;
  const EXPECTED_REMOVED_COUNT = itemsToAdd.filter(item => item.name === NAME_TO_REMOVE).length;
  const EXPECTED_REMAINING_COUNT = INITIAL_ITEMS_COUNT - EXPECTED_REMOVED_COUNT;

  itemsToAdd.forEach(item => list.add(item));

  expect(list.items.length).toEqual(INITIAL_ITEMS_COUNT);

  const removedCount = list.remove(PROPERTY_TO_MATCH, NAME_TO_REMOVE);

  expect(removedCount).toEqual(EXPECTED_REMOVED_COUNT);
  expect(list.items.length).toEqual(EXPECTED_REMAINING_COUNT);
});