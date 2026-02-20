it('should trigger filterStart and filterComplete events in correct order', function (done) {
      var done1 = false
      var startTriggered = false
      var completeTriggered = false
      
      list.on('filterStart', function (list) {
        startTriggered = true
      })
      
      list.on('filterComplete', function (list) {
        completeTriggered = true
        if (startTriggered) {
          expect(startTriggered).toBe(true)
          expect(completeTriggered).toBe(true)
          done()
        }
      })
      
      list.filter(function () {
        return true
      })
    })