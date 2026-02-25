it('should be triggered before and after filter', function (done) {
      const events = []
      list.on('filterStart', function () {
        events.push('filterStart')
      })
      list.on('filterComplete', function () {
        events.push('filterComplete')
        expect(events).toEqual(['filterStart', 'filterComplete'])
        done()
      })
      list.filter(function () {
        return true
      })
    })