const INITIAL_LIST_SIZE = 9
const REMOVED_ITEM_COUNT = 8
const FINAL_LIST_SIZE = 2

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
  
  expect(list.items.length).toEqual(INITIAL_LIST_SIZE)
  const count = list.remove('name', 'Jonny')
  expect(count).toEqual(REMOVED_ITEM_COUNT)
  expect(list.items.length).toEqual(FINAL_LIST_SIZE)
})