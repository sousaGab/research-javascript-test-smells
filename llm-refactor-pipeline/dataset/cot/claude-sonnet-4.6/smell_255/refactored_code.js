it('should be triggered before and after sort', function (done) {
      var sortStartTriggered = false
      var sortCompleteTriggered = false

      list.on('sortStart', function (list) {
        sortStartTriggered = true
      })
      list.on('sortComplete', function (list) {
        sortCompleteTriggered = true
        expect(sortStartTriggered).toBe(true)
        expect(sortCompleteTriggered).toBe(true)
        done()
      })
      list.sort('name')
    })