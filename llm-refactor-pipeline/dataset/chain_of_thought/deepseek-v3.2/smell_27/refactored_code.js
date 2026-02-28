const INITIAL_ITEM_COUNT = 1;
const ITEM_NAME = 'Jonas';
const ITEM_PROPERTY = 'name';
const EXPECTED_REMOVAL_COUNT = 1;
const EXPECTED_FINAL_COUNT = 1;

it('should remove one item', function () {
    list.add({ name: ITEM_NAME });
    expect(list.items.length).toEqual(INITIAL_ITEM_COUNT + 1);
    var count = list.remove(ITEM_PROPERTY, ITEM_NAME);
    expect(count).toEqual(EXPECTED_REMOVAL_COUNT);
    expect(list.items.length).toEqual(EXPECTED_FINAL_COUNT);
});