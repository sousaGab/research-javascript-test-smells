it('should trigger sortComplete', function (done) {
  list.on('sortComplete', function () {
    expect(true).toBe(true); // Add assertion to verify the event was triggered
    done()
  })
  fireClick($('#sort-name')[0])
})