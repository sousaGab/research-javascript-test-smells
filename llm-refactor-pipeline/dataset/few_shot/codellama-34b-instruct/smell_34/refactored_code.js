const CUSTOM_SEARCH_FUNCTION = function (item) {
  // custom search function implementation
};

it('should use custom function in third argument', function () {
  const result = list.search('jonny', ['name'], CUSTOM_SEARCH_FUNCTION)
  expect(result.length).toEqual(4)
});