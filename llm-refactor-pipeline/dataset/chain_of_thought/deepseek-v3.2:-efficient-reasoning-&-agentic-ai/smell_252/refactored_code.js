it('should trigger sortComplete', function (done) {
  let eventTriggered = false;
  
  list.on('sortComplete', function () {
    eventTriggered = true;
    done();
  });
  
  fireClick($('#sort-name')[0]);
  
  // Verify the event was actually triggered
  setTimeout(() => {
    expect(eventTriggered).toBe(true);
  }, 100);
});