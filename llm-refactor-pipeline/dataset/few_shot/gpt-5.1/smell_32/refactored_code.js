it('should not remove unnamed handlers', function (done) {
  const INITIAL_HANDLER_COUNT = 3;
  const EXPECTED_HANDLER_COUNT_AFTER_REMOVAL = 2;

  const unnamedHandlerOne = function () {};
  const unnamedHandlerTwo = function () {};

  const searchComplete = function (list) {
    expect(list.handlers.searchComplete.length).toEqual(INITIAL_HANDLER_COUNT);

    list.off('searchComplete', unnamedHandlerOne);
    list.off('searchComplete', searchComplete);

    expect(list.handlers.searchComplete.length).toEqual(EXPECTED_HANDLER_COUNT_AFTER_REMOVAL);
    done();
  };

  list.on('searchComplete', unnamedHandlerOne);
  list.on('searchComplete', searchComplete);
  list.on('searchComplete', unnamedHandlerTwo);
  list.search('jonny');
});