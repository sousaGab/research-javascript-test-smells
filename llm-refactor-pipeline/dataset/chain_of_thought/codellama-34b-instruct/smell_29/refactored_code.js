// Your COMPLETE refactored test code here

const ORIGINAL_ITEMS_COUNT = 2;
const EXPECTED_ITEMS_COUNT = 2;

it('should contain two items', function () {
    list.add({ name: 'Jonas' });
    expect(list.items.length).toEqual(EXPECTED_ITEMS_COUNT);
    expect(listEl.find('li').length).toEqual(EXPECTED_ITEMS_COUNT);
});