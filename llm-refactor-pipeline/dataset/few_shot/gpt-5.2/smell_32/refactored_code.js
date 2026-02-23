it('should not remove unnamed handlers', function (done) {
  const INITIAL_SEARCH_COMPLETE_HANDLERS_COUNT = 3
  const EXPECTED_SEARCH_COMPLETE_HANDLERS_COUNT_AFTER_REMOVAL = 2

  var searchComplete = function (list) {
    expect(list.handlers.searchComplete.length).toEqual(INITIAL_SEARCH_COMPLETE_HANDLERS_COUNT)
    list.off('searchComplete', function () {})
    list.off('searchComplete', searchComplete)
    expect(list.handlers.searchComplete.length).toEqual(EXPECTED_SEARCH_COMPLETE_HANDLERS_COUNT_AFTER_REMOVAL)
    done()
  }

  list.on('searchComplete', function () {})
  list.on('searchComplete', searchComplete)
  list.on('searchComplete', function () {})
  list.search('jonny')
})