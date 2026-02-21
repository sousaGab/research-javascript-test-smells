it('should trigger sortStart and sortComplete events', function (done) {
  var startTriggered = false;
  var completeTriggered = false;
  
  list.on('sortStart', function (list) {
    startTriggered = true;
  });
  
  list.on('sortComplete', function (list) {
    completeTriggered = true;
    expect(startTriggered).toBe(true);
    expect(completeTriggered).toBe(true);
    done();
  });
  
  list.sort('name');
});