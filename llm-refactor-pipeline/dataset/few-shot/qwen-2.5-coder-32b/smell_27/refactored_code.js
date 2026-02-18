const INITIAL_ITEMS_LENGTH = 1;
const ADDED_ITEM = { name: 'Jonas' };
const REMOVED_ITEM_COUNT = 1;
const FINAL_ITEMS_LENGTH = 1;

it('should remove one item', function () {
  list.add(ADDED_ITEM)
  expect(list.items.length).toEqual(INITIAL_ITEMS_LENGTH + 1)
  var count = list.remove('name', ADDED_ITEM.name)
  expect(count).toEqual(REMOVED_ITEM_COUNT)
  expect(list.items.length).toEqual(FINAL_ITEMS_LENGTH)
})