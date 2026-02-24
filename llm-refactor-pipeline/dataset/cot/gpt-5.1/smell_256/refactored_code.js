it('should trigger both handlers when searching for jonny', function (done) {
  var done1 = false
  var done2 = false

  var isDone = function () {
    if (done1 && done2) {
      expect(done1).toBe(true)
      expect(done2).toBe(true)
      done()
    }
  }

  list.on('updated', function (updatedList) {
    done1 = true
    expect(updatedList).toBeDefined()
    isDone()
  })

  list.on('updated', function (updatedList) {
    done2 = true
    expect(updatedList).toBeDefined()
    isDone()
  })

  list.search('jonny')
})