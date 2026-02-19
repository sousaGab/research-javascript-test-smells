it('should trigger filterStart and filterComplete events in correct order', function (done) {
      var done1 = false
      var done2 = false
      list.on('filterStart', function (list) {
        done1 = true
      })
      list.on('filterComplete', function (list) {
        if (done1) {
          done2 = true
          expect(done1).toBe(true)
          expect(done2).toBe(true)
          done()
        }
      })
      list.filter(function () {
        return true
      })
    })