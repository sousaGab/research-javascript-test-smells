const INITIAL_LIST_LENGTH_AFTER_ADD = 2;
const EXPECTED_REMOVE_COUNT = 1;
const EXPECTED_LIST_LENGTH_AFTER_REMOVE = 1;

it('should remove one item', function () {
  list.add({ name: 'Jonas' })
  expect(list.items.length).toEqual(INITIAL_LIST_LENGTH_AFTER_ADD)
  var count = list.remove('name', 'Jonas')
  expect(count).toEqual(EXPECTED_REMOVE_COUNT)
  expect(list.items.length).toEqual(EXPECTED_LIST_LENGTH_AFTER_REMOVE)
})