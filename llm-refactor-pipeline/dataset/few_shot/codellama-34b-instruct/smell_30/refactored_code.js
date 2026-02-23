// Your COMPLETE refactored test code here

it('should contain one item', function () {
    const expectedLength = 1;
    expect(list.items.length).toEqual(expectedLength);
    expect(listEl.find('tr').length).toEqual(expectedLength);
})