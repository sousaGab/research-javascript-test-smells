// Your COMPLETE refactored test code here

it('should trigger sortComplete', function (done) {
  list.on('sortComplete', function () {
    done()
  })
  fireClick($('#sort-name')[0])
})