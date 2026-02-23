// Your COMPLETE refactored test code here
it('should use custom function in third argument', function () {
    const searchTerm = 'jonny';
    const searchFields = ['name'];
    const customSearchFunction = function (item) {
        return item.name.includes(searchTerm);
    };
    const result = list.search(searchTerm, searchFields, customSearchFunction);
    expect(result.length).toEqual(4);
});