it('should be trigger both handlers', function (done) {
      var done1 = false,
        done2 = false,
        isDone = function () {
          if (done1 && done2) {
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

      expect(list.length).toBe(2)
      expect(list[0].name).toBe('Jonny')
      expect(list[1].name).toBe('Jonny')
    })