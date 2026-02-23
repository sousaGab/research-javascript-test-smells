it('should remove one item', function () {
  const INITIAL_ITEM_COUNT = 2
  const EXPECTED_REMOVED_COUNT = 1
  const EXPECTED_FINAL_ITEM_COUNT = 1

  list.add({ name: 'Jonas' })

  expect(list.items.length).toEqual(INITIAL_ITEM_COUNT)

  var count = list.remove('name', 'Jonas')

  expect(count).toEqual(EXPECTED_REMOVED_COUNT)
  expect(list.items.length).toEqual(EXPECTED_FINAL_ITEM_COUNT)
})