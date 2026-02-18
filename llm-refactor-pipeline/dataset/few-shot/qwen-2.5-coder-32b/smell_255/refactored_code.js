it('should trigger sort events before and after sort', function (done) {
      var done1 = false
      list.on('sortStart', function (list) {
        done1 = true
      })
      list.on('sortComplete', function (list) {
        if (done1) {
          expect(done1).toBe(true)
          done()
        }
      })
      list.sort('name')
    })