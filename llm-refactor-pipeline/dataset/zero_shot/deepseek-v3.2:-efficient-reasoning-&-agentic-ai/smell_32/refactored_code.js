it('should not remove unnamed handlers', function (done) {
  const initialHandlerCount = 3;
  const handlerCountAfterRemoval = 2;
  
  var searchComplete = function (list) {
    expect(list.handlers.searchComplete.length).toEqual(initialHandlerCount);
    list.off('searchComplete', function () {});
    list.off('searchComplete', searchComplete);
    expect(list.handlers.searchComplete.length).toEqual(handlerCountAfterRemoval);
    done();
  };
  
  list.on('searchComplete', function () {});
  list.on('searchComplete', searchComplete);
  list.on('searchComplete', function () {});
  list.search('jonny');
});