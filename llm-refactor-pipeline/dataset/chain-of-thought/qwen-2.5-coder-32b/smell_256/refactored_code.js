it('should trigger both handlers', function (done) {
  var done1 = false,
    done2 = false,
    isDone = function () {
      if (done1 && done2) {
        done()
      }
    }

  list.on('updated', function (list) {
    done1 = true
    isDone()
  })
  list.on('updated', function (list) {
    done2 = true
    isDone()
  })
  
  list.search('jonny')
  
  // Add assertions to verify the handlers were called
  expect(done1).toBe(true)
  expect(done2).toBe(true)
})