it('should trigger searchComplete', function (done) {
  let eventTriggered = false;
  
  list.on('searchComplete', function () {
    eventTriggered = true;
    expect(eventTriggered).to.be.true;
    done();
  });
  
  $('#list-fuzzy-search .fuzzy-search').val('angelica');
  fireKeyup($('#list-fuzzy-search .fuzzy-search')[0]);
});