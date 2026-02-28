it('should trigger searchComplete', function (done) {
  let eventTriggered = false;
  
  list.on('searchComplete', function () {
    eventTriggered = true;
    done();
  });
  
  $('#list-fuzzy-search .fuzzy-search').val('angelica');
  fireKeyup($('#list-fuzzy-search .fuzzy-search')[0]);
  
  // Add assertion to verify the event was triggered
  setTimeout(() => {
    expect(eventTriggered).toBe(true);
  }, 100);
});