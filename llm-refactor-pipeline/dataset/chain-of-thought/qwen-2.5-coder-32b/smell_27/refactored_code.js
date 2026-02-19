const INITIAL_LIST_LENGTH = 1
const ITEM_TO_ADD = { name: 'Jonas' }
const EXPECTED_FINAL_LENGTH = 1
const REMOVED_ITEM_COUNT = 1

it('should remove one item', function () {
  list.add(ITEM_TO_ADD)
  expect(list.items.length).toEqual(INITIAL_LIST_LENGTH + 1)
  const count = list.remove('name', ITEM_TO_ADD.name)
  expect(count).toEqual(REMOVED_ITEM_COUNT)
  expect(list.items.length).toEqual(EXPECTED_FINAL_LENGTH)
})