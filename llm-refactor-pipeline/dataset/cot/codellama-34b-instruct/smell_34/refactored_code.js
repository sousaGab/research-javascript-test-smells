it('should use custom function in third argument', function () {
    const CUSTOM_SEARCH_FUNCTION = customSearchFunction;
    const EXPECTED_RESULT_LENGTH = 4;

    var result = list.search('jonny', ['name'], CUSTOM_SEARCH_FUNCTION)
    expect(result.length).toEqual(EXPECTED_RESULT_LENGTH);
})