it('should be triggered before and after filter', function (done) {
  var done1 = false
  var startCalled = false
  var completeCalled = false

  list.on('filterStart', function (emittedList) {
    startCalled = true
    done1 = true
    expect(emittedList).toBe(list)
  })

  list.on('filterComplete', function (emittedList) {
    completeCalled = true
    expect(emittedList).toBe(list)
    expect(done1).toBe(true)
    expect(startCalled).toBe(true)
    expect(completeCalled).toBe(true)
    done()
  })

  list.filter(function () {
    return true
  })
})