it('should be trigger both handlers', function (done) {
      var done1 = false,
        done2 = false,
        isDone = function () {
          if (done1 && done2) {
            expect(done1).toBe(true)
            expect(done2).toBe(true)
            done()
          }
        }

      list.on('updated', function (list) {
        done1 = true
        isDone()
      })
      list.on('updated', function (list) {
        done2 = true
        isDone()
      })
      list.search('jonny')
    })