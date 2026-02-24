it('should trigger sortComplete', function (done) {
  list.on('sortComplete', function () {
    expect(true).toBe(true);
    done();
  });
  fireClick($('#sort-name')[0]);
});