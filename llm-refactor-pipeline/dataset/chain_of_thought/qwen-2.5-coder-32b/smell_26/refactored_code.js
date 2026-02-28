const INITIAL_LIST_LENGTH = 10
const REMOVED_ITEM_COUNT = 8
const FINAL_LIST_LENGTH = 2
const ITEM_NAME = 'Jonny'

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
  expect(list.items.length).toEqual(INITIAL_LIST_LENGTH)
  var count = list.remove('name', ITEM_NAME)
  expect(count).toEqual(REMOVED_ITEM_COUNT)
  expect(list.items.length).toEqual(FINAL_LIST_LENGTH)
})