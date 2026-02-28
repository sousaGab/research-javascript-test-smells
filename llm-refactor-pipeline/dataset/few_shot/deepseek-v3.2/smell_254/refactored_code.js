it('should be triggered before and after filter', function (done) {
  var filterStartTriggered = false;
  
  list.on('filterStart', function (list) {
    filterStartTriggered = true;
  });
  
  list.on('filterComplete', function (list) {
    expect(filterStartTriggered).toBe(true);
    done();
  });
  
  list.filter(function () {
    return true;
  });
});