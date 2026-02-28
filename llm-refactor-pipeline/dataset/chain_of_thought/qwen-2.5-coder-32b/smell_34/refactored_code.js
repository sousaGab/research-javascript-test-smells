const EXPECTED_RESULT_LENGTH = 4;

it('should use custom function in third argument', function () {
  var result = list.search('jonny', ['name'], customSearchFunction);
  expect(result.length).toEqual(EXPECTED_RESULT_LENGTH);
});