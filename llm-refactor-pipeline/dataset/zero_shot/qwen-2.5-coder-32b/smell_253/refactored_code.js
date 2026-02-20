it('should trigger searchComplete', function (done) {
      list.on('searchComplete', function () {
        expect(true).toBe(true);
        done()
      })
      $('#list-fuzzy-search .fuzzy-search').val('angelica')
      fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])
    })