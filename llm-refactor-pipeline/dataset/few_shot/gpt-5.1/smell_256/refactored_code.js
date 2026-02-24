it('should trigger both handlers', function (done) {
  var done1 = false,
    done2 = false,
    callCount = 0,
    isDone = function () {
      if (done1 && done2) {
        expect(callCount).toBe(2)
        done()
      }
    }

  list.on('updated', function (updatedList) {
    done1 = true
    callCount++
    expect(updatedList).toBe(list)
    isDone()
  })
  list.on('updated', function (updatedList) {
    done2 = true
    callCount++
    expect(updatedList).toBe(list)
    isDone()
  })
  list.search('jonny')
})