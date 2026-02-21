it('should remove eight items', function () {
  const INITIAL_LENGTH = 10
  const REMOVED_COUNT = 8
  const FINAL_LENGTH = 2
  const ITEM_NAME = 'Jonny'

  list.add({ name: 'Jonny' })
  list.add({ name: 'Jonny' })
  list.add({ name: 'Sven' })
  list.add({ name: 'Jonny' })
  list.add({ name: 'Jonny' })
  list.add({ name: 'Jonny' })
  list.add({ name: 'Jonas' })
  list.add({ name: 'Jonny' })
  list.add({ name: 'Jonny' })
  
  expect(list.items.length).toEqual(INITIAL_LENGTH)
  
  var count = list.remove('name', ITEM_NAME)
  
  expect(count).toEqual(REMOVED_COUNT)
  expect(list.items.length).toEqual(FINAL_LENGTH)
})