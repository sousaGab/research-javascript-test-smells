it('should trigger searchComplete', function (done) {
  let eventTriggered = false;
  
  list.on('searchComplete', function () {
    eventTriggered = true;
    done();
  });
  
  $('#parse-list .search').val('jon');
  fireKeyup($('#parse-list .search')[0]);
  
  // Verify the event was actually triggered
  setTimeout(() => {
    expect(eventTriggered).toBe(true);
  }, 100);
});