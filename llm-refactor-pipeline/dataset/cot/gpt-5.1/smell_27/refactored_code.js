it('should remove one item', function () {
  const INITIAL_ITEMS_COUNT = 1
  const EXPECTED_ITEMS_COUNT_AFTER_ADD = 2
  const EXPECTED_REMOVED_ITEMS_COUNT = 1
  const EXPECTED_ITEMS_COUNT_AFTER_REMOVE = 1
  const ITEM_NAME_KEY = 'name'
  const ITEM_NAME_VALUE = 'Jonas'

  expect(list.items.length).toEqual(INITIAL_ITEMS_COUNT)

  list.add({ [ITEM_NAME_KEY]: ITEM_NAME_VALUE })
  expect(list.items.length).toEqual(EXPECTED_ITEMS_COUNT_AFTER_ADD)

  const removedItemsCount = list.remove(ITEM_NAME_KEY, ITEM_NAME_VALUE)
  expect(removedItemsCount).toEqual(EXPECTED_REMOVED_ITEMS_COUNT)
  expect(list.items.length).toEqual(EXPECTED_ITEMS_COUNT_AFTER_REMOVE)
})