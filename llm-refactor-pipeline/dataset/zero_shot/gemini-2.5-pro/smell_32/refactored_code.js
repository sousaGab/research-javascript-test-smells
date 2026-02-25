it('should not remove unnamed handlers', function (done) {
      const INITIAL_HANDLER_COUNT = 3;
      const EXPECTED_HANDLER_COUNT_AFTER_REMOVAL = 2;

      const searchComplete = function (list) {
        expect(list.handlers.searchComplete.length).toEqual(INITIAL_HANDLER_COUNT);

        // This should not remove any handlers as it's a new function instance
        list.off('searchComplete', function () {});
        // This should remove the specific named handler
        list.off('searchComplete', searchComplete);

        expect(list.handlers.searchComplete.length).toEqual(EXPECTED_HANDLER_COUNT_AFTER_REMOVAL);
        done();
      };

      list.on('searchComplete', function () {});
      list.on('searchComplete', searchComplete);
      list.on('searchComplete', function () {});

      list.search('jonny');
    });