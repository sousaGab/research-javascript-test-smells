// Your COMPLETE refactored test code here
const EXPECTED_ITEM_COUNT = 2;

it('should contain two items', function () {
  list.add({ name: 'Jonas' });

  expect(list.items.length).toEqual(EXPECTED_ITEM_COUNT);
  expect(listEl.find('li').length).toEqual(EXPECTED_ITEM_COUNT);
});