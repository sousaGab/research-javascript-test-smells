it('should trigger searchComplete', function (done) {
      list.on('searchComplete', function (list) {
        expect(list.visibleItems.length).toBe(1);
        expect(list.visibleItems[0].values().name).toBe('Angelica');
        done();
      });
      $('#list-fuzzy-search .fuzzy-search').val('angelica');
      fireKeyup($('#list-fuzzy-search .fuzzy-search')[0]);
    });