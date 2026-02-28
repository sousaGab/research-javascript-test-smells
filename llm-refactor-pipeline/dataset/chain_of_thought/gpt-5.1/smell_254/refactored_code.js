it('should trigger filterStart before filterComplete when filtering', function (done) {
  let filterStartCalled = false
  let filterCompleteCalled = false

  list.on('filterStart', function () {
    filterStartCalled = true
  })

  list.on('filterComplete', function () {
    filterCompleteCalled = true
    try {
      expect(filterStartCalled).toBe(true)
      expect(filterCompleteCalled).toBe(true)
      done()
    } catch (error) {
      done(error)
    }
  })

  list.filter(function () {
    return true
  })
})