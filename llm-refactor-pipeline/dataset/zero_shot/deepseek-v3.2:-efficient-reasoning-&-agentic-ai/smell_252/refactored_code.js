it('should trigger sortComplete', function (done) {
  let eventTriggered = false;
  
  list.on('sortComplete', function () {
    eventTriggered = true;
    expect(eventTriggered).to.be.true;
    done();
  });
  
  fireClick($('#sort-name')[0]);
});