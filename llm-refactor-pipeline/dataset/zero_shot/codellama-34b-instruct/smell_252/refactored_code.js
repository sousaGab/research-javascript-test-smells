it('should trigger sortComplete', function (done) {
  list.on('sortComplete', function () {
    expect(list.sortComplete).toBe(true);
    done();
  });
  fireClick($('#sort-name')[0]);
});