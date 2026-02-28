it('should be triggered before and after filter', function (done) {
  var filterStartCalled = false;
  
  list.on('filterStart', function (list) {
    filterStartCalled = true;
  });
  
  list.on('filterComplete', function (list) {
    if (!filterStartCalled) {
      done(new Error('filterStart event was not triggered before filterComplete'));
      return;
    }
    done();
  });
  
  list.filter(function () {
    return true;
  });
});