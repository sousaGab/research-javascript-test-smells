it('should trigger sortComplete', function (done) {
  const sortCompleteHandler = function () {
    expect(true).toBe(true); // Assert that the event was triggered
    done();
  };

  list.on('sortComplete', sortCompleteHandler);
  fireClick($('#sort-name')[0]);
});