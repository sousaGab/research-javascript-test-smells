it('should be triggered before and after sort', function (done) {
  var sortStartCalled = false
  var sortCompleteCalled = false

  list.on('sortStart', function () {
    sortStartCalled = true
  })

  list.on('sortComplete', function () {
    sortCompleteCalled = true
    try {
      if (!sortStartCalled) {
        throw new Error('Expected sortStart to be triggered before sortComplete')
      }
      done()
    } catch (err) {
      done(err)
    }
  })

  list.sort('name')

  setTimeout(function () {
    if (!sortCompleteCalled) {
      done(new Error('Expected sortComplete to be triggered'))
    }
  }, 0)
})