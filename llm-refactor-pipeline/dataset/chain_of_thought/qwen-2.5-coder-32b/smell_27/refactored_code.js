it('should remove one item', function () {
  const INITIAL_ITEMS_COUNT = 2
  const REMOVED_ITEM_COUNT = 1
  const FINAL_ITEMS_COUNT = 1

  list.add({ name: 'Jonas' })
  expect(list.items.length).toEqual(INITIAL_ITEMS_COUNT)
  var count = list.remove('name', 'Jonas')
  expect(count).toEqual(REMOVED_ITEM_COUNT)
  expect(list.items.length).toEqual(FINAL_ITEMS_COUNT)
})