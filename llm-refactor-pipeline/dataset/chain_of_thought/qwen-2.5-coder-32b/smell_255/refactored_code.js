it('should trigger sortStart before sortComplete', function (done) {
  var done1 = false;
  var sortStartTriggered = false;
  
  list.on('sortStart', function (list) {
    sortStartTriggered = true;
  });
  
  list.on('sortComplete', function (list) {
    if (sortStartTriggered) {
      done();
    } else {
      done(new Error('sortComplete was triggered before sortStart'));
    }
  });
  
  list.sort('name');
});