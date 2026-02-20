it('should not remove unnamed handlers', function (done) {
      const HANDLER_COUNT_BEFORE = 3
      const HANDLER_COUNT_AFTER = 2
      
      var searchComplete = function (list) {
        expect(list.handlers.searchComplete.length).toEqual(HANDLER_COUNT_BEFORE)
        list.off('searchComplete', function () {})
        list.off('searchComplete', searchComplete)
        expect(list.handlers.searchComplete.length).toEqual(HANDLER_COUNT_AFTER)
        done()
      }
      list.on('searchComplete', function () {})
      list.on('searchComplete', searchComplete)
      list.on('searchComplete', function () {})
      list.search('jonny')
    })