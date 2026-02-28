const INITIAL_LIST_LENGTH = 10;
const JONNY_COUNT = 8;
const REMAINING_ITEMS_COUNT = 2;

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
  var count = list.remove('name', 'Jonny')
  expect(count).toEqual(JONNY_COUNT)
  expect(list.items.length).toEqual(REMAINING_ITEMS_COUNT)
})