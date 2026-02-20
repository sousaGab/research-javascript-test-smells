it('should be triggered before and after filter', function (done) {
      var done1 = false
      var done2 = false
      list.on('filterStart', function (list) {
        done1 = true
        expect(done1).to.be.true
      })
      list.on('filterComplete', function (list) {
        done2 = true
        expect(done2).to.be.true
        if (done1) {
          done()
        }
      })
      list.filter(function () {
        return true
      })
    })