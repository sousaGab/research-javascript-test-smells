const INITIAL_ITEM_COUNT = 10
const REMOVED_ITEM_COUNT = 8
const FINAL_ITEM_COUNT = 2

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
  expect(list.items.length).toEqual(INITIAL_ITEM_COUNT)
  var count = list.remove('name', 'Jonny')
  expect(count).toEqual(REMOVED_ITEM_COUNT)
  expect(list.items.length).toEqual(FINAL_ITEM_COUNT)
})