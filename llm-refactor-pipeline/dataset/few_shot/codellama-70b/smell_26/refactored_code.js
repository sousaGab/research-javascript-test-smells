it('should remove eight items', function () {
  const JONNY_NAME = 'Jonny';
  const JONNY_COUNT = 8;
  const OTHER_NAMES = ['Sven', 'Jonas'];

  list.add({ name: JONNY_NAME });
  list.add({ name: JONNY_NAME });
  list.add({ name: OTHER_NAMES[0] });
  list.add({ name: JONNY_NAME });
  list.add({ name: JONNY_NAME });
  list.add({ name: JONNY_NAME });
  list.add({ name: OTHER_NAMES[1] });
  list.add({ name: JONNY_NAME });
  list.add({ name: JONNY_NAME });

  expect(list.items.length).toEqual(10);

  const count = list.remove('name', JONNY_NAME);
  expect(count).toEqual(JONNY_COUNT);
  expect(list.items.length).toEqual(2);
});