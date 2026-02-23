// Your COMPLETE refactored test code here

it('should not remove unnamed handlers', function (done) {
  const searchCompleteHandler = function (list) {
    expect(list.handlers.searchComplete.length).toEqual(3)
    list.off('searchComplete', searchCompleteHandler)
    expect(list.handlers.searchComplete.length).toEqual(2)
    done()
  }
  list.on('searchComplete', searchCompleteHandler)
  list.search('jonny')
})