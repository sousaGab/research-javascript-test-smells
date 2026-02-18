it('should be triggered before and after sort', function (done) {
      var done1 = false
      var done2 = false
      list.on('sortStart', function (list) {
        done1 = true
        if (done1 && done2) {
          done()
        }
      })
      list.on('sortComplete', function (list) {
        done2 = true
        if (done1 && done2) {
          done()
        }
      })
      list.sort('name')
    })