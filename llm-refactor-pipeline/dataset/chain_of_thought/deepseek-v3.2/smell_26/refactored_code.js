const INITIAL_ITEM_COUNT = 10;
const ITEMS_TO_REMOVE_COUNT = 8;
const REMAINING_ITEMS_COUNT = 2;
const TARGET_NAME = 'Jonny';
const OTHER_NAME_1 = 'Sven';
const OTHER_NAME_2 = 'Jonas';

it('should remove eight items', function () {
  list.add({ name: TARGET_NAME });
  list.add({ name: TARGET_NAME });
  list.add({ name: OTHER_NAME_1 });
  list.add({ name: TARGET_NAME });
  list.add({ name: TARGET_NAME });
  list.add({ name: TARGET_NAME });
  list.add({ name: OTHER_NAME_2 });
  list.add({ name: TARGET_NAME });
  list.add({ name: TARGET_NAME });
  
  expect(list.items.length).toEqual(INITIAL_ITEM_COUNT);
  
  var count = list.remove('name', TARGET_NAME);
  expect(count).toEqual(ITEMS_TO_REMOVE_COUNT);
  expect(list.items.length).toEqual(REMAINING_ITEMS_COUNT);
});