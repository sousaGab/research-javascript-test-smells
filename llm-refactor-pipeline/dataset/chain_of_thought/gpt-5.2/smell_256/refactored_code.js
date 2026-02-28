it('should trigger both handlers', function (done) {
  var done1 = false
  var done2 = false
  var callCount = 0

  function isDone() {
    if (done1 && done2) {
      expect(callCount).toBe(2)
      done()
    }
  }

  list.on('updated', function (updatedList) {
    callCount += 1
    done1 = true
    expect(updatedList).toBe(list)
    isDone()
  })

  list.on('updated', function (updatedList) {
    callCount += 1
    done2 = true
    expect(updatedList).toBe(list)
    isDone()
  })

  list.search('jonny')
})