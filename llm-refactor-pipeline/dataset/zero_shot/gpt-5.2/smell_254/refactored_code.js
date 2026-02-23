it('should be triggered before and after filter', function (done) {
  var filterStartCalled = false
  var filterCompleteCalled = false

  list.on('filterStart', function () {
    filterStartCalled = true
  })

  list.on('filterComplete', function () {
    filterCompleteCalled = true
    try {
      if (typeof expect === 'function') {
        expect(filterStartCalled).to.equal(true)
        expect(filterCompleteCalled).to.equal(true)
      } else {
        if (!filterStartCalled) throw new Error('Expected filterStart to be called before filterComplete')
        if (!filterCompleteCalled) throw new Error('Expected filterComplete to be called')
      }
      done()
    } catch (err) {
      done(err)
    }
  })

  list.filter(function () {
    return true
  })
})