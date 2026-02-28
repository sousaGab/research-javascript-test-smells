const SEARCH_QUERY = 'jonny';
const SEARCH_FIELDS = ['name'];
const EXPECTED_MATCH_COUNT = 4;

it('should use custom function in third argument', function () {
  const result = list.search(SEARCH_QUERY, SEARCH_FIELDS, customSearchFunction);
  expect(result.length).toEqual(EXPECTED_MATCH_COUNT);
});