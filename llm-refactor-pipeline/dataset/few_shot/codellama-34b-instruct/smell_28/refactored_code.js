// Your COMPLETE refactored test code here

it('should not remove anything due to case sensitivity', function () {
    const expectedCount = 0;
    const expectedItemsLength = 1;
    const name = 'jonny';
    const count = list.remove('name', name);
    expect(count).toBe(expectedCount);
    expect(list.items.length).toEqual(expectedItemsLength);
});