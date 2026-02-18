it('should trigger filterStart before filterComplete', function (done) {
      var done1 = false
      var done2 = false
      list.on('filterStart', function (list) {
        done1 = true
      })
      list.on('filterComplete', function (list) {
        done2 = true
        if (done1 && done2) {
          expect(done1).toBe(true)
          expect(done2).toBe(true)
          done()
        }
      })
      list.filter(function () {
        return true
      })
    })