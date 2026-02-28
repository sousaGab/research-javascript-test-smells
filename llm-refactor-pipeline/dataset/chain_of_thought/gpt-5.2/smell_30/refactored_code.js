const EXPECTED_SINGLE_ITEM_COUNT = 1;

it('should contain one item', function () {
  const actualItemCount = list.items.length;
  const actualRenderedRowCount = listEl.find('tr').length;

  expect(actualItemCount).toEqual(EXPECTED_SINGLE_ITEM_COUNT);
  expect(actualRenderedRowCount).toEqual(EXPECTED_SINGLE_ITEM_COUNT);
});