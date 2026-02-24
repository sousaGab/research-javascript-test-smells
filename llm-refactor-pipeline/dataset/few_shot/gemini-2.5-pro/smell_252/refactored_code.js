it('should trigger sortComplete', function (done) {
      list.on('sortComplete', function () {
        expect(list.items[0].values().name).toBe('Jonas');
        done();
      });
      fireClick($('#sort-name')[0]);
    });