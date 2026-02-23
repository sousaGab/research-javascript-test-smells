it('should not remove unnamed handlers', function (done) {
  var INITIAL_HANDLER_COUNT = 3
  var EXPECTED_HANDLER_COUNT_AFTER_REMOVALS = 2

  var unnamedHandlerToRemove = function () {}

  var searchComplete = function (list) {
    expect(list.handlers.searchComplete.length).toEqual(INITIAL_HANDLER_COUNT)
    list.off('searchComplete', unnamedHandlerToRemove)
    list.off('searchComplete', searchComplete)
    expect(list.handlers.searchComplete.length).toEqual(EXPECTED_HANDLER_COUNT_AFTER_REMOVALS)
    done()
  }

  list.on('searchComplete', unnamedHandlerToRemove)
  list.on('searchComplete', searchComplete)
  list.on('searchComplete', function () {})
  list.search('jonny')
})