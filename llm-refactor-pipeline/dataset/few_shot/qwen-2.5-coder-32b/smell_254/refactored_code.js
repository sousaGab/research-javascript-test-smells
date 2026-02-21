it('should trigger filterStart and filterComplete events', function (done) {
  var done1 = false;
  var done2 = false;
  
  list.on('filterStart', function (list) {
    done1 = true;
  });
  
  list.on('filterComplete', function (list) {
    done2 = true;
    if (done1 && done2) {
      done();
    }
  });
  
  list.filter(function () {
    return true;
  });
  
  // Assert that both events were triggered
  expect(done1).toBe(true);
  expect(done2).toBe(true);
});