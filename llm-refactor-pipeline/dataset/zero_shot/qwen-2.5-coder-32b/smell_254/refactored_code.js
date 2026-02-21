it('should trigger filterStart and filterComplete events', function (done) {
  var startTriggered = false;
  var completeTriggered = false;
  
  list.on('filterStart', function (list) {
    startTriggered = true;
  });
  
  list.on('filterComplete', function (list) {
    completeTriggered = true;
    expect(startTriggered).toBe(true);
    expect(completeTriggered).toBe(true);
    done();
  });
  
  list.filter(function () {
    return true;
  });
});