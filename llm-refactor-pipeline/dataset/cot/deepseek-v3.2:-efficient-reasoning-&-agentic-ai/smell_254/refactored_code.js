it('should be triggered before and after filter', function (done) {
  var filterStartCalled = false;
  var filterCompleteCalled = false;
  
  list.on('filterStart', function (list) {
    filterStartCalled = true;
  });
  
  list.on('filterComplete', function (list) {
    filterCompleteCalled = true;
  });
  
  list.filter(function () {
    return true;
  });
  
  setTimeout(function () {
    expect(filterStartCalled).toBe(true);
    expect(filterCompleteCalled).toBe(true);
    done();
  }, 0);
});