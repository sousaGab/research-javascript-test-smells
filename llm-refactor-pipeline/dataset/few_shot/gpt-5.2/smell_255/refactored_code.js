// Your COMPLETE refactored test code here
it('should be triggered before and after sort', function (done) {
  let sortStartCalled = false
  let sortCompleteCalled = false

  list.on('sortStart', function () {
    sortStartCalled = true
  })

  list.on('sortComplete', function () {
    sortCompleteCalled = true
    try {
      expect(sortStartCalled).toBe(true)
      expect(sortCompleteCalled).toBe(true)
      done()
    } catch (err) {
      done(err)
    }
  })

  list.sort('name')
})