// Your COMPLETE refactored test code here
it('should trigger sortComplete', function (done) {
  const handler = function () {
    list.off('sortComplete', handler);
    expect(true).toBe(true);
    done();
  };

  list.on('sortComplete', handler);
  fireClick($('#sort-name')[0]);
});