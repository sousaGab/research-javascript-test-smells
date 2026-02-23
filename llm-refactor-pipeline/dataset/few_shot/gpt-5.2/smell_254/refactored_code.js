it('should be triggered before and after filter', function (done) {
  let filterStartCalled = false
  let filterCompleteCalled = false

  list.on('filterStart', function (emittedList) {
    filterStartCalled = true
    expect(emittedList).toBe(list)
  })

  list.on('filterComplete', function (emittedList) {
    filterCompleteCalled = true
    expect(emittedList).toBe(list)

    expect(filterStartCalled).toBe(true)
    expect(filterCompleteCalled).toBe(true)
    done()
  })

  list.filter(function () {
    return true
  })
})