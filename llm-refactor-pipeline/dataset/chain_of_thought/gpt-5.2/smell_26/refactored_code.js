// Your COMPLETE refactored test code here
it('should remove eight items', function () {
  const TARGET_NAME_TO_REMOVE = 'Jonny'
  const OTHER_NAME_1 = 'Sven'
  const OTHER_NAME_2 = 'Jonas'

  const INITIAL_ITEM_COUNT = 10
  const EXPECTED_REMOVED_COUNT = 8
  const EXPECTED_REMAINING_COUNT = 2

  list.add({ name: TARGET_NAME_TO_REMOVE })
  list.add({ name: TARGET_NAME_TO_REMOVE })
  list.add({ name: OTHER_NAME_1 })
  list.add({ name: TARGET_NAME_TO_REMOVE })
  list.add({ name: TARGET_NAME_TO_REMOVE })
  list.add({ name: TARGET_NAME_TO_REMOVE })
  list.add({ name: OTHER_NAME_2 })
  list.add({ name: TARGET_NAME_TO_REMOVE })
  list.add({ name: TARGET_NAME_TO_REMOVE })

  expect(list.items.length).toEqual(INITIAL_ITEM_COUNT)

  var count = list.remove('name', TARGET_NAME_TO_REMOVE)

  expect(count).toEqual(EXPECTED_REMOVED_COUNT)
  expect(list.items.length).toEqual(EXPECTED_REMAINING_COUNT)
})