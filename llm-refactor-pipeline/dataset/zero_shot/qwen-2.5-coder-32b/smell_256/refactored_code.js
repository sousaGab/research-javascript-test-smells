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
    expect(done1).toBe(true);
    isDone()
  })
  list.on('updated', function (list) {
    done2 = true
    expect(done2).toBe(true);
    isDone()
  })
  list.search('jonny')
})