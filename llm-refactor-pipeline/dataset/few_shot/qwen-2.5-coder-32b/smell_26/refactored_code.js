const INITIAL_ITEMS_COUNT = 10
const REMOVED_ITEMS_COUNT = 8
const REMAINING_ITEMS_COUNT = 2

it('should remove eight items', function () {
  list.add({ name: 'Jonny' })
  list.add({ name: 'Jonny' })
  list.add({ name: 'Sven' })
  list.add({ name: 'Jonny' })
  list.add({ name: 'Jonny' })
  list.add({ name: 'Jonny' })
  list.add({ name: 'Jonas' })
  list.add({ name: 'Jonny' })
  list.add({ name: 'Jonny' })
  expect(list.items.length).toEqual(INITIAL_ITEMS_COUNT)
  var count = list.remove('name', 'Jonny')
  expect(count).toEqual(REMOVED_ITEMS_COUNT)
  expect(list.items.length).toEqual(REMAINING_ITEMS_COUNT)
})