it('should remove eight items', function () {
  const JONNY_NAME = 'Jonny'
  const INITIAL_TOTAL_ITEMS = 10
  const EXPECTED_REMOVED_ITEMS = 8
  const EXPECTED_REMAINING_ITEMS = 2

  list.add({ name: JONNY_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: 'Sven' })
  list.add({ name: JONNY_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: 'Jonas' })
  list.add({ name: JONNY_NAME })
  list.add({ name: JONNY_NAME })

  expect(list.items.length).toEqual(INITIAL_TOTAL_ITEMS)

  var count = list.remove('name', JONNY_NAME)

  expect(count).toEqual(EXPECTED_REMOVED_ITEMS)
  expect(list.items.length).toEqual(EXPECTED_REMAINING_ITEMS)
})