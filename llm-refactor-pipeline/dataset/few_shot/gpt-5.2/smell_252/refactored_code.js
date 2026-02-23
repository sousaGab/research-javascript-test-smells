it('should trigger sortComplete', function (done) {
  expect.assertions(1);

  list.on('sortComplete', function () {
    expect(true).toBe(true);
    done();
  });

  fireClick($('#sort-name')[0]);
});