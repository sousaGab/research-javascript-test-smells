it('should trigger sortComplete', function (done) {
  list.on('sortComplete', function () {
    expect(list.sortComplete).to.be.true;
    done();
  });
  fireClick($('#sort-name')[0]);
});