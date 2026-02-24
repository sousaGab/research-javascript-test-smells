it('should trigger both handlers', function (done) {
  let done1 = false
  let done2 = false

  const isDone = function () {
    if (done1 && done2) {
      expect(done1).to.be.true
      expect(done2).to.be.true
      done()
    }
  }

  list.on('updated', function () {
    done1 = true
    isDone()
  })

  list.on('updated', function () {
    done2 = true
    isDone()
  })

  list.search('jonny')
})