it('should remove eight items', function () {
  const NAME_PROPERTY = 'name';
  const TARGET_NAME = 'Jonny';
  const OTHER_NAME_1 = 'Sven';
  const OTHER_NAME_2 = 'Jonas';

  const INITIAL_JONNY_COUNT = 7;
  const INITIAL_OTHER_ITEMS_COUNT = 2;
  const EXPECTED_INITIAL_ITEMS_LENGTH = INITIAL_JONNY_COUNT + INITIAL_OTHER_ITEMS_COUNT;
  const EXPECTED_REMOVED_COUNT = INITIAL_JONNY_COUNT;
  const EXPECTED_FINAL_ITEMS_LENGTH = EXPECTED_INITIAL_ITEMS_LENGTH - EXPECTED_REMOVED_COUNT;

  list.add({ [NAME_PROPERTY]: TARGET_NAME });
  list.add({ [NAME_PROPERTY]: TARGET_NAME });
  list.add({ [NAME_PROPERTY]: OTHER_NAME_1 });
  list.add({ [NAME_PROPERTY]: TARGET_NAME });
  list.add({ [NAME_PROPERTY]: TARGET_NAME });
  list.add({ [NAME_PROPERTY]: TARGET_NAME });
  list.add({ [NAME_PROPERTY]: OTHER_NAME_2 });
  list.add({ [NAME_PROPERTY]: TARGET_NAME });
  list.add({ [NAME_PROPERTY]: TARGET_NAME });

  expect(list.items.length).toEqual(EXPECTED_INITIAL_ITEMS_LENGTH);

  var removedCount = list.remove(NAME_PROPERTY, TARGET_NAME);

  expect(removedCount).toEqual(EXPECTED_REMOVED_COUNT);
  expect(list.items.length).toEqual(EXPECTED_FINAL_ITEMS_LENGTH);
});