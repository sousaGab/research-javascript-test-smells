it('should trigger sortComplete', function (done) {
      list.on('sortComplete', function () {
        var names = list.items.map(function(item) {
          return item.values().name;
        });
        expect(names).toEqual(['Duff', 'Imma', 'Jonas', 'Jonny']);
        done();
      });
      fireClick($('#sort-name')[0]);
    });