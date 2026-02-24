it('should use custom function in third argument', function () {
  const SEARCH_TERM = 'jonny';
  const SEARCH_FIELDS = ['name'];
  const EXPECTED_MATCH_COUNT = 4;

  const result = list.search(SEARCH_TERM, SEARCH_FIELDS, customSearchFunction);
  expect(result.length).toEqual(EXPECTED_MATCH_COUNT);
})