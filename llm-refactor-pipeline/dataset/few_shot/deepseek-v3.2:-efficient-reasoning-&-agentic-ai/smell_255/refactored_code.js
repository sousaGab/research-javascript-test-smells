it('should be triggered before and after sort', function (done) {
  var sortStartTriggered = false;
  
  list.on('sortStart', function (list) {
    sortStartTriggered = true;
  });
  
  list.on('sortComplete', function (list) {
    expect(sortStartTriggered).toBe(true);
    done();
  });
  
  list.sort('name');
});