it('should trigger searchComplete', function (done) {
      list.on('searchComplete', function (list) {
        expect(list).toBeDefined()
        done()
      })
      $('#list-fuzzy-search .fuzzy-search').val('angelica')
      fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])
    })