// Your COMPLETE refactored test code here

const CUSTOM_SEARCH_FUNCTION = (item, searchTerm) => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
};

it('should use custom function in third argument', function () {
    const result = list.search('jonny', ['name'], CUSTOM_SEARCH_FUNCTION);
    expect(result.length).toEqual(4);
});