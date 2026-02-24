it('should not remove unnamed handlers', function (done) {
  var INITIAL_HANDLER_COUNT = 3
  var FINAL_HANDLER_COUNT = 2

  var searchComplete = function (list) {
    expect(list.handlers.searchComplete.length).toEqual(INITIAL_HANDLER_COUNT)
    list.off('searchComplete', function () {})
    list.off('searchComplete', searchComplete)
    expect(list.handlers.searchComplete.length).toEqual(FINAL_HANDLER_COUNT)
    done()
  }

  list.on('searchComplete', function () {})
  list.on('searchComplete', searchComplete)
  list.on('searchComplete', function () {})
  list.search('jonny')
})