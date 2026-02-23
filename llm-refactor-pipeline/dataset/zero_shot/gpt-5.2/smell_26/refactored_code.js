it('should remove eight items', function () {
  var TARGET_NAME = 'Jonny'
  var OTHER_NAMES = ['Sven', 'Jonas']
  var TOTAL_ITEMS = 10
  var EXPECTED_REMOVED_COUNT = 8
  var EXPECTED_REMAINING_COUNT = TOTAL_ITEMS - EXPECTED_REMOVED_COUNT

  var itemsToAdd = [
    { name: TARGET_NAME },
    { name: TARGET_NAME },
    { name: OTHER_NAMES[0] },
    { name: TARGET_NAME },
    { name: TARGET_NAME },
    { name: TARGET_NAME },
    { name: OTHER_NAMES[1] },
    { name: TARGET_NAME },
    { name: TARGET_NAME }
  ]

  itemsToAdd.forEach(function (item) {
    list.add(item)
  })

  expect(list.items.length).toEqual(TOTAL_ITEMS)

  var count = list.remove('name', TARGET_NAME)

  expect(count).toEqual(EXPECTED_REMOVED_COUNT)
  expect(list.items.length).toEqual(EXPECTED_REMAINING_COUNT)
})