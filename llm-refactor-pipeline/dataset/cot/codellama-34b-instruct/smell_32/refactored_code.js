it('should not remove unnamed handlers', function (done) {
  const NUM_HANDLERS_BEFORE_REMOVAL = 3;
  const NUM_HANDLERS_AFTER_REMOVAL = 2;

  const searchComplete = function (list) {
    expect(list.handlers.searchComplete.length).toEqual(NUM_HANDLERS_BEFORE_REMOVAL);
    list.off('searchComplete', function () {});
    list.off('searchComplete', searchComplete);
    expect(list.handlers.searchComplete.length).toEqual(NUM_HANDLERS_AFTER_REMOVAL);
    done();
  }

  list.on('searchComplete', function () {});
  list.on('searchComplete', searchComplete);
  list.on('searchComplete', function () {});
  list.search('jonny');
});