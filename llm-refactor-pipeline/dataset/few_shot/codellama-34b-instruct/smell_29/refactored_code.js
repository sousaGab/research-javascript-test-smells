// Your COMPLETE refactored test code here

it('should contain two items', function () {
    const name = 'Jonas';
    const expectedLength = 2;
    list.add({ name: name });
    expect(list.items.length).toEqual(expectedLength);
    expect(listEl.find('li').length).toEqual(expectedLength);
})