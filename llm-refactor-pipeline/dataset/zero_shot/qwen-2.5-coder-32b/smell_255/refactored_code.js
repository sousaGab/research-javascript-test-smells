it('should be triggered before and after sort', function (done) {
      var done1 = false
      var done2 = false
      list.on('sortStart', function (list) {
        done1 = true
        expect(done1).toBe(true)
      })
      list.on('sortComplete', function (list) {
        done2 = true
        expect(done2).toBe(true)
        if (done1) {
          done()
        }
      })
      list.sort('name')
    })