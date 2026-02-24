it('should use custom function in third argument', function () {
  const EXPECTED_MATCH_COUNT = 4

  var result = list.search('jonny', ['name'], customSearchFunction)
  expect(result.length).toEqual(EXPECTED_MATCH_COUNT)
})