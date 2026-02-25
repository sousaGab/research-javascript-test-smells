it('should contain two items', function () {
  const EXPECTED_ITEMS_LENGTH = 2;
  list.add({ name: 'Jonas' });
  expect(list.items.length).toEqual(EXPECTED_ITEMS_LENGTH);
  expect(listEl.find('li').length).toEqual(EXPECTED_ITEMS_LENGTH);
});