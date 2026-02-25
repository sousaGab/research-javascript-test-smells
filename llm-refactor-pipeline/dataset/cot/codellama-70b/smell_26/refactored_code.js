it('should remove eight items', function () {
  const JONNY_COUNT = 8;
  const EXPECTED_ITEM_COUNT = 2;

  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Sven' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonas' });
  list.add({ name: 'Jonny' });
  list.add({ name: 'Jonny' });
  expect(list.items.length).toEqual(10);
  const count = list.remove('name', 'Jonny');
  expect(count).toEqual(JONNY_COUNT);
  expect(list.items.length).toEqual(EXPECTED_ITEM_COUNT);
});