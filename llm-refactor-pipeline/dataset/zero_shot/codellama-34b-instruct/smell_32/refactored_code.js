const SEARCH_COMPLETE_HANDLERS_COUNT = 3;
const SEARCH_COMPLETE_HANDLER_NAME = 'searchComplete';

it('should not remove unnamed handlers', function (done) {
  var searchComplete = function (list) {
    expect(list.handlers[SEARCH_COMPLETE_HANDLER_NAME].length).toEqual(SEARCH_COMPLETE_HANDLERS_COUNT)
    list.off(SEARCH_COMPLETE_HANDLER_NAME, function () {})
    list.off(SEARCH_COMPLETE_HANDLER_NAME, searchComplete)
    expect(list.handlers[SEARCH_COMPLETE_HANDLER_NAME].length).toEqual(SEARCH_COMPLETE_HANDLERS_COUNT - 1)
    done()
  }
  list.on(SEARCH_COMPLETE_HANDLER_NAME, function () {})
  list.on(SEARCH_COMPLETE_HANDLER_NAME, searchComplete)
  list.on(SEARCH_COMPLETE_HANDLER_NAME, function () {})
  list.search('jonny')
})