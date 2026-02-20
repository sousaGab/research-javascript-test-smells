it('should trigger searchComplete', function (done) {
      const spy = jasmine.createSpy('searchComplete')
      list.on('searchComplete', spy)
      $('#list-fuzzy-search .fuzzy-search').val('angelica')
      fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])
      
      setTimeout(() => {
        expect(spy).toHaveBeenCalled()
        done()
      }, 0)
    })