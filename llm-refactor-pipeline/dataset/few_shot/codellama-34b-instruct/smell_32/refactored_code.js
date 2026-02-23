// Your COMPLETE refactored test code here

it('should not remove unnamed handlers', function (done) {
  const searchComplete = function (list) {
    expect(list.handlers.searchComplete.length).toEqual(3)
    list.off('searchComplete', function () {})
    list.off('searchComplete', searchComplete)
    expect(list.handlers.searchComplete.length).toEqual(2)
    done()
  }
  list.on('searchComplete', function () {})
  list.on('searchComplete', searchComplete)
  list.on('searchComplete', function () {})
  list.search('jonny')
})