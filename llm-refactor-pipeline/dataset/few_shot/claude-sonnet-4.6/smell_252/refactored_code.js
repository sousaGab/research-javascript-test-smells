it('should trigger sortComplete', function (done) {
      let sortCompleted = false
      list.on('sortComplete', function () {
        sortCompleted = true
        done()
      })
      fireClick($('#sort-name')[0])
      setTimeout(function () {
        expect(sortCompleted).toBe(true)
      }, 0)
    })