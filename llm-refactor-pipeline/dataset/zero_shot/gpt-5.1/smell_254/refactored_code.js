it('should be triggered before and after filter', function (done) {
  var filterStartCalled = false
  var filterCompleteCalled = false

  list.on('filterStart', function () {
    filterStartCalled = true
  })

  list.on('filterComplete', function () {
    filterCompleteCalled = true
    try {
      expect(filterStartCalled).to.be.true
      expect(filterCompleteCalled).to.be.true
      done()
    } catch (err) {
      done(err)
    }
  })

  list.filter(function () {
    return true
  })
})