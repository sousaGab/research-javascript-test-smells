it('should trigger filterStart and filterComplete events', function (done) {
  var done1 = false
  var startEventTriggered = false
  var completeEventTriggered = false
  
  list.on('filterStart', function (list) {
    startEventTriggered = true
  })
  
  list.on('filterComplete', function (list) {
    completeEventTriggered = true
    if (startEventTriggered) {
      expect(startEventTriggered).toBe(true)
      expect(completeEventTriggered).toBe(true)
      done()
    }
  })
  
  list.filter(function () {
    return true
  })
})