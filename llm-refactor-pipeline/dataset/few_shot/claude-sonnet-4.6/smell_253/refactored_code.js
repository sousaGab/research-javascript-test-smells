it('should trigger searchComplete', function (done) {
      list.on('searchComplete', function () {
        expect(list.searched).toBe(true);
        expect(list.visibleItems.length).toBeGreaterThanOrEqual(0);
        done()
      })
      $('#list-fuzzy-search .fuzzy-search').val('angelica')
      fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])
    })