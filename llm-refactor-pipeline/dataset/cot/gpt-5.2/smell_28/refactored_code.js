// Your COMPLETE refactored test code here
it('should not remove anything due to case sensitivity', function () {
  const EXPECTED_REMOVED_COUNT = 0;
  const EXPECTED_ITEMS_REMAINING = 1;

  const removedCount = list.remove('name', 'jonny');

  expect(removedCount).toBe(EXPECTED_REMOVED_COUNT);
  expect(list.items.length).toEqual(EXPECTED_ITEMS_REMAINING);
});