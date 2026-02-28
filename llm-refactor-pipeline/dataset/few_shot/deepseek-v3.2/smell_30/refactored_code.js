const EXPECTED_ITEM_COUNT = 1;

it('should contain one item', function () {
  expect(list.items.length).toEqual(EXPECTED_ITEM_COUNT);
  expect(listEl.find('tr').length).toEqual(EXPECTED_ITEM_COUNT);
});