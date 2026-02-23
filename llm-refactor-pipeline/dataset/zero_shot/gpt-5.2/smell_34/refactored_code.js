it('should use custom function in third argument', function () {
  var result = list.search('jonny', ['name'], customSearchFunction)

  var EXPECTED_MATCH_COUNT = 4
  expect(result.length).toEqual(EXPECTED_MATCH_COUNT)
})