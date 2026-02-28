it('should trigger searchComplete', function (done) {
  let searchCompleteTriggered = false;
  
  list.on('searchComplete', function () {
    searchCompleteTriggered = true;
    done();
  });
  
  $('#list-fuzzy-search .fuzzy-search').val('angelica');
  fireKeyup($('#list-fuzzy-search .fuzzy-search')[0]);
  
  // Add assertion to verify the event was triggered
  setTimeout(() => {
    expect(searchCompleteTriggered).toBe(true);
  }, 100);
});