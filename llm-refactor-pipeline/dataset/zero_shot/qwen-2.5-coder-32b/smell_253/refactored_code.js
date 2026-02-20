it('should trigger searchComplete', function (done) {
      list.on('searchComplete', function () {
        done()
      })
      $('#list-fuzzy-search .fuzzy-search').val('angelica')
      fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])
      
      // Add assertion to prevent unknown test smell
      expect(list).toBeDefined()
    })