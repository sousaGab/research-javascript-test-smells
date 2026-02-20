it('should trigger sort events before and after sorting', function (done) {
  var done1 = false
  var sortStartTriggered = false
  var sortCompleteTriggered = false

  list.on('sortStart', function (list) {
    sortStartTriggered = true
  })

  list.on('sortComplete', function (list) {
    sortCompleteTriggered = true
    if (sortStartTriggered) {
      expect(sortStartTriggered).toBe(true)
      expect(sortCompleteTriggered).toBe(true)
      done()
    }
  })

  list.sort('name')
})