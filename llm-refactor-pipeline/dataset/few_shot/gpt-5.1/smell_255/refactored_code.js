it('should be triggered before and after sort', function (done) {
  var done1 = false
  var sortStartCalled = false
  var sortCompleteCalled = false

  list.on('sortStart', function (listInstance) {
    done1 = true
    sortStartCalled = true
  })

  list.on('sortComplete', function (listInstance) {
    sortCompleteCalled = true
    if (done1) {
      expect(sortStartCalled).toBe(true)
      expect(sortCompleteCalled).toBe(true)
      done()
    }
  })

  list.sort('name')
})