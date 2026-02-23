it('should be trigger both handlers', function (done) {
      var handler1Called = false,
        handler2Called = false,
        isDone = function () {
          if (handler1Called && handler2Called) {
            expect(handler1Called).toBe(true)
            expect(handler2Called).toBe(true)
            done()
          }
        }

      list.on('updated', function (list) {
        handler1Called = true
        isDone()
      })
      list.on('updated', function (list) {
        handler2Called = true
        isDone()
      })
      list.search('jonny')
    })