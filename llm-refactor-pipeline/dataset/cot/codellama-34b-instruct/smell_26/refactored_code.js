// Your COMPLETE refactored test code here

it('should remove eight items', function () {
  const ORIGINAL_ITEMS = 10;
  const EXPECTED_REMOVAL = 8;
  const EXPECTED_REMAINING_ITEMS = 2;

  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Sven' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonas' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonny' });

  expect(list.items.length).toEqual(ORIGINAL_ITEMS);
  var count = list.remove('name', 'Jonny');
  expect(count).toEqual(EXPECTED_REMOVAL);
  expect(list.items.length).toEqual(EXPECTED_REMAINING_ITEMS);
});