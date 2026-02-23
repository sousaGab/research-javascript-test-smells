// Your COMPLETE refactored test code here

it('should not remove anything due to case sensitivity', function () {
    const ORIGINAL_LIST_LENGTH = 1;
    const EXPECTED_LIST_LENGTH = 1;
    const ITEM_NAME = 'name';
    const ITEM_VALUE = 'jonny';

    var count = list.remove(ITEM_NAME, ITEM_VALUE)
    expect(count).toBe(0)
    expect(list.items.length).toEqual(EXPECTED_LIST_LENGTH)
});