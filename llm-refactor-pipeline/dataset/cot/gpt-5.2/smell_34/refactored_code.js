const EXPECTED_MATCH_COUNT = 4;

it('should use custom function in third argument', function () {
  const searchTerm = 'jonny';
  const searchableFields = ['name'];

  const result = list.search(searchTerm, searchableFields, customSearchFunction);

  expect(result.length).toEqual(EXPECTED_MATCH_COUNT);
});