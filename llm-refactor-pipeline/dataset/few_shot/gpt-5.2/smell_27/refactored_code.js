it('should remove one item', function () {
  const ITEM_NAME_KEY = 'name'
  const ITEM_NAME_VALUE = 'Jonas'
  const EXPECTED_LENGTH_AFTER_ADD = 2
  const EXPECTED_REMOVED_COUNT = 1
  const EXPECTED_LENGTH_AFTER_REMOVE = 1

  list.add({ [ITEM_NAME_KEY]: ITEM_NAME_VALUE })
  expect(list.items.length).toEqual(EXPECTED_LENGTH_AFTER_ADD)

  var count = list.remove(ITEM_NAME_KEY, ITEM_NAME_VALUE)
  expect(count).toEqual(EXPECTED_REMOVED_COUNT)
  expect(list.items.length).toEqual(EXPECTED_LENGTH_AFTER_REMOVE)
})