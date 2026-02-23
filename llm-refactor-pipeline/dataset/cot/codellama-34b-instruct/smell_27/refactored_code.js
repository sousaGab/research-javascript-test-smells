// Your COMPLETE refactored test code here

it('should remove one item', function () {
    const ORIGINAL_ITEM_COUNT = 2;
    const EXPECTED_ITEM_COUNT_AFTER_REMOVAL = 1;
    const ITEM_NAME_TO_REMOVE = 'Jonas';

    list.add({ name: ITEM_NAME_TO_REMOVE });
    expect(list.items.length).toEqual(ORIGINAL_ITEM_COUNT);
    const count = list.remove('name', ITEM_NAME_TO_REMOVE);
    expect(count).toEqual(1);
    expect(list.items.length).toEqual(EXPECTED_ITEM_COUNT_AFTER_REMOVAL);
});