// Your COMPLETE refactored test code here
it('should trigger sortComplete', function (done) {
  list.on('sortComplete', function () {
    expect(list.isSorted()).toBe(true);
    done();
  })
  fireClick($('#sort-name')[0]);
})