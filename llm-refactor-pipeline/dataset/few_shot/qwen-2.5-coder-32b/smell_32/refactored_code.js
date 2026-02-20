const EXPECTED_HANDLER_COUNT_AFTER_ADD = 3
const EXPECTED_HANDLER_COUNT_AFTER_REMOVE = 2

it('should not remove unnamed handlers', function (done) {
  var searchComplete = function (list) {
    expect(list.handlers.searchComplete.length).toEqual(EXPECTED_HANDLER_COUNT_AFTER_ADD)
    list.off('searchComplete', function () {})
    list.off('searchComplete', searchComplete)
    expect(list.handlers.searchComplete.length).toEqual(EXPECTED_HANDLER_COUNT_AFTER_REMOVE)
    done()
  }
  list.on('searchComplete', function () {})
  list.on('searchComplete', searchComplete)
  list.on('searchComplete', function () {})
  list.search('jonny')
})