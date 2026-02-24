it('should remove eight items', function () {
  const JONNY_NAME = 'Jonny';
  const SVEN_NAME = 'Sven';
  const JONAS_NAME = 'Jonas';
  const EXPECTED_INITIAL_LENGTH = 10;
  const EXPECTED_REMOVED_COUNT = 8;
  const EXPECTED_FINAL_LENGTH = 2;
  const PROPERTY_NAME = 'name';

  list.add({ name: JONNY_NAME });
  list.add({ name: JONNY_NAME });
  list.add({ name: SVEN_NAME });
  list.add({ name: JONNY_NAME });
  list.add({ name: JONNY_NAME });
  list.add({ name: JONNY_NAME });
  list.add({ name: JONAS_NAME });
  list.add({ name: JONNY_NAME });
  list.add({ name: JONNY_NAME });

  expect(list.items.length).toEqual(EXPECTED_INITIAL_LENGTH);

  const count = list.remove(PROPERTY_NAME, JONNY_NAME);

  expect(count).toEqual(EXPECTED_REMOVED_COUNT);
  expect(list.items.length).toEqual(EXPECTED_FINAL_LENGTH);
})