it('should trigger searchComplete', function (done) {
      const spy = jasmine.createSpy()
      list.on('searchComplete', spy)
      $('#parse-list .search').val('jon')
      fireKeyup($('#parse-list .search')[0])
      
      setTimeout(() => {
        expect(spy).toHaveBeenCalled()
        done()
      }, 0)
    })