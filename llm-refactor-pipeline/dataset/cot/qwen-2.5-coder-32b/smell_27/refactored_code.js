const INITIAL_LIST_LENGTH = 1
const ITEM_COUNT_AFTER_REMOVAL = 0
const REMOVED_ITEM_COUNT = 1

it('should remove one item', function () {
  list.add({ name: 'Jonas' })
  expect(list.items.length).toEqual(INITIAL_LIST_LENGTH + 1)
  const count = list.remove('name', 'Jonas')
  expect(count).toEqual(REMOVED_ITEM_COUNT)
  expect(list.items.length).toEqual(ITEM_COUNT_AFTER_REMOVAL)
})