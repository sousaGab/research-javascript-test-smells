const INITIAL_ITEM_COUNT = 1;
const ADDED_ITEM_NAME = 'Jonas';
const EXPECTED_REMOVAL_COUNT = 1;
const FINAL_ITEM_COUNT = 1;

it('should remove one item', function () {
    list.add({ name: ADDED_ITEM_NAME });
    expect(list.items.length).toEqual(INITIAL_ITEM_COUNT + 1);
    var count = list.remove('name', ADDED_ITEM_NAME);
    expect(count).toEqual(EXPECTED_REMOVAL_COUNT);
    expect(list.items.length).toEqual(FINAL_ITEM_COUNT);
});