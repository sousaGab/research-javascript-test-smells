it('should trigger sortComplete', function (done) {
      const sortCompleteSpy = jasmine.createSpy('sortComplete')
      list.on('sortComplete', sortCompleteSpy)
      fireClick($('#sort-name')[0])
      
      setTimeout(() => {
        expect(sortCompleteSpy).toHaveBeenCalled()
        done()
      }, 0)
    })