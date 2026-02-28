it('should be triggered before and after filter', function (done) {
      var filterStartTriggered = false
      var filterCompleteTriggered = false

      list.on('filterStart', function (list) {
        filterStartTriggered = true
      })
      list.on('filterComplete', function (list) {
        filterCompleteTriggered = true
        expect(filterStartTriggered).toBe(true)
        expect(filterCompleteTriggered).toBe(true)
        done()
      })
      list.filter(function () {
        return true
      })
    })