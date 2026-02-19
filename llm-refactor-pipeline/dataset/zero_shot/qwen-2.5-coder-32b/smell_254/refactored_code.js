it('should be triggered before and after filter', function (done) {
      var done1 = false
      var done2 = false
      list.on('filterStart', function (list) {
        done1 = true
        expect(done1).toBe(true)
      })
      list.on('filterComplete', function (list) {
        done2 = true
        expect(done1).toBe(true)
        expect(done2).toBe(true)
        done()
      })
      list.filter(function () {
        return true
      })
    })