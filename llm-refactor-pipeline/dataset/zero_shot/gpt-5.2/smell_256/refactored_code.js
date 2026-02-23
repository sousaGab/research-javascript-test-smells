it('should be trigger both handlers', function (done) {
  var callCount = 0

  function handler() {
    callCount += 1
    if (callCount === 2) {
      if (typeof expect === 'function') {
        expect(callCount).to.equal(2)
      } else {
        require('assert').strictEqual(callCount, 2)
      }
      done()
    }
  }

  list.on('updated', handler)
  list.on('updated', handler)

  list.search('jonny')
})