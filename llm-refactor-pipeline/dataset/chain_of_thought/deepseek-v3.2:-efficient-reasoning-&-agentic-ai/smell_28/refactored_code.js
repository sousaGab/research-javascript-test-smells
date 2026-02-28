const EXPECTED_REMOVAL_COUNT = 0;
const EXPECTED_REMAINING_ITEMS = 1;

it('should not remove anything due to case sensitivity', function () {
    var count = list.remove('name', 'jonny')
    expect(count).toBe(EXPECTED_REMOVAL_COUNT)
    expect(list.items.length).toEqual(EXPECTED_REMAINING_ITEMS)
})