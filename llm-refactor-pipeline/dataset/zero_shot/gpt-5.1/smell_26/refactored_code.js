it('should remove all Jonny items and keep non-Jonny items', function () {
  const JONNY_NAME = 'Jonny'
  const SVEN_NAME = 'Sven'
  const JONAS_NAME = 'Jonas'
  const EXPECTED_TOTAL_ITEMS = 10
  const EXPECTED_JONNY_REMOVED_COUNT = 8
  const EXPECTED_REMAINING_ITEMS = 2

  list.add({ name: JONNY_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: SVEN_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: JONAS_NAME })
  list.add({ name: JONNY_NAME })
  list.add({ name: JONNY_NAME })

  expect(list.items.length).toEqual(EXPECTED_TOTAL_ITEMS)

  const removedCount = list.remove('name', JONNY_NAME)

  expect(removedCount).toEqual(EXPECTED_JONNY_REMOVED_COUNT)
  expect(list.items.length).toEqual(EXPECTED_REMAINING_ITEMS)
})