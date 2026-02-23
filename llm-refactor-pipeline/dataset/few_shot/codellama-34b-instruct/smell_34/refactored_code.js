// Your COMPLETE refactored test code here

it('should use custom function in third argument', function () {
  const CUSTOM_SEARCH_FUNCTION = function (item) {
    return item.name === 'jonny';
  };
  const result = list.search('jonny', ['name'], CUSTOM_SEARCH_FUNCTION);
  expect(result.length).toEqual(4);
});