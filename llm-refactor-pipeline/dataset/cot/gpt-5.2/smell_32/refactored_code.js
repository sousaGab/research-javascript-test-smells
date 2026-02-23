it('should not remove unnamed handlers', function (done) {
  const SEARCH_TERM = 'jonny'
  const EXPECTED_HANDLERS_BEFORE_OFF = 3
  const EXPECTED_HANDLERS_AFTER_OFF = 2

  const unnamedHandler = function () {}

  var searchComplete = function (list) {
    expect(list.handlers.searchComplete.length).toEqual(EXPECTED_HANDLERS_BEFORE_OFF)
    list.off('searchComplete', function () {})
    list.off('searchComplete', searchComplete)
    expect(list.handlers.searchComplete.length).toEqual(EXPECTED_HANDLERS_AFTER_OFF)
    done()
  }

  list.on('searchComplete', unnamedHandler)
  list.on('searchComplete', searchComplete)
  list.on('searchComplete', unnamedHandler)
  list.search(SEARCH_TERM)
})