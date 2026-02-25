it('should be triggered before and after sort', function (done) {
      const events = []
      list.on('sortStart', function () {
        events.push('start')
      })
      list.on('sortComplete', function () {
        events.push('complete')
        expect(events).toEqual(['start', 'complete'])
        done()
      })
      list.sort('name')
    })