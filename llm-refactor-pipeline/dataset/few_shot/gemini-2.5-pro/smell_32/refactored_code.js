it('should not remove unnamed handlers', function (done) {
      const INITIAL_HANDLER_COUNT = 3;
      const FINAL_HANDLER_COUNT = 2;

      var searchComplete = function (list) {
        expect(list.handlers.searchComplete.length).toEqual(INITIAL_HANDLER_COUNT);

        // This should not remove any handlers since the function instance is different
        list.off('searchComplete', function () {});
        // This should remove the named handler
        list.off('searchComplete', searchComplete);

        expect(list.handlers.searchComplete.length).toEqual(FINAL_HANDLER_COUNT);
        done();
      };

      list.on('searchComplete', function () {});
      list.on('searchComplete', searchComplete);
      list.on('searchComplete', function () {});

      list.search('jonny');
    });