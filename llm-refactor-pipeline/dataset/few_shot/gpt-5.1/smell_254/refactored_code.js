it('should be triggered before and after filter', function (done) {
  var done1 = false
  var filterStartCalled = false
  var filterCompleteCalled = false

  list.on('filterStart', function (listInstance) {
    done1 = true
    filterStartCalled = true
    expect(listInstance).toBe(list)
  })

  list.on('filterComplete', function (listInstance) {
    filterCompleteCalled = true
    expect(listInstance).toBe(list)
    expect(done1).toBe(true)
    expect(filterStartCalled).toBe(true)
    expect(filterCompleteCalled).toBe(true)
    done()
  })

  list.filter(function () {
    return true
  })
})