it('should not remove unnamed handlers', function (done) {
      const INITIAL_HANDLER_COUNT = 3;
      const HANDLER_COUNT_AFTER_REMOVAL = 2;

      var searchComplete = function (list) {
        expect(list.handlers.searchComplete.length).toEqual(INITIAL_HANDLER_COUNT)
        list.off('searchComplete', function () {})
        list.off('searchComplete', searchComplete)
        expect(list.handlers.searchComplete.length).toEqual(HANDLER_COUNT_AFTER_REMOVAL)
        done()
      }
      list.on('searchComplete', function () {})
      list.on('searchComplete', searchComplete)
      list.on('searchComplete', function () {})
      list.search('jonny')
    })