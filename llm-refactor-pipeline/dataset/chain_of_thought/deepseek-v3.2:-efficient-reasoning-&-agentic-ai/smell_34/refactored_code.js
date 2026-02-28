const SEARCH_QUERY = 'jonny';
const SEARCH_FIELDS = ['name'];
const EXPECTED_RESULT_LENGTH = 4;

it('should use custom function in third argument', function () {
  var result = list.search(SEARCH_QUERY, SEARCH_FIELDS, customSearchFunction)
  expect(result.length).toEqual(EXPECTED_RESULT_LENGTH)
})