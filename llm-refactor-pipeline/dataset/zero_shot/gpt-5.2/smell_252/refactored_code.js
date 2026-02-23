it('should trigger sortComplete', function (done) {
  let called = false

  list.on('sortComplete', function () {
    called = true
    done()
  })

  fireClick($('#sort-name')[0])

  setTimeout(function () {
    if (!called) done(new Error('Expected sortComplete to be triggered'))
  }, 0)
})