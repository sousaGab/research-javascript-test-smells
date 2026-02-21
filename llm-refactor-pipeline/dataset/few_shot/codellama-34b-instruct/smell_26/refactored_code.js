const EXPECTED_ITEMS_LENGTH = 10;
const EXPECTED_REMOVED_COUNT = 8;
const EXPECTED_REMAINING_ITEMS_LENGTH = 2;

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
  expect(list.items.length).toEqual(EXPECTED_ITEMS_LENGTH)
  var count = list.remove('name', 'Jonny')
  expect(count).toEqual(EXPECTED_REMOVED_COUNT)
  expect(list.items.length).toEqual(EXPECTED_REMAINING_ITEMS_LENGTH)
})