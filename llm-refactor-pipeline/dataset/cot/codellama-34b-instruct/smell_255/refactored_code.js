it('should be triggered before and after sort', function (done) {
      var done1 = false
      list.on('sortStart', function (list) {
        done1 = true
      })
      list.on('sortComplete', function (list) {
        if (done1) {
          expect(list.length).toBeGreaterThan(0);
          expect(list[0].name).toBe('John');
          done()
        }
      })
      list.sort('name')
    })