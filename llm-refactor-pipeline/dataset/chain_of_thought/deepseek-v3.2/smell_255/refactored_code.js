it('should be triggered before and after sort', function (done) {
  var sortStartCalled = false;
  
  list.on('sortStart', function (list) {
    sortStartCalled = true;
  });
  
  list.on('sortComplete', function (list) {
    expect(sortStartCalled).toBe(true);
    expect(list).toBeDefined();
    done();
  });
  
  list.sort('name');
});