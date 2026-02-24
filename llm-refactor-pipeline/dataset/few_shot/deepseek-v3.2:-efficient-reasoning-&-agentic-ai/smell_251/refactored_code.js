it('should trigger searchComplete', function (done) {
  let searchCompleteTriggered = false;
  
  list.on('searchComplete', function () {
    searchCompleteTriggered = true;
    done();
  });
  
  $('#parse-list .search').val('jon');
  fireKeyup($('#parse-list .search')[0]);
  
  // Add assertion to verify the event was triggered
  setTimeout(() => {
    expect(searchCompleteTriggered).toBe(true);
  }, 100);
});