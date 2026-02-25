it('should trigger sortComplete and sort the list by name', function (done) {
      list.on('sortComplete', function () {
        // Assert that the list is now sorted by name
        expect(list.items[0].values().name).toBe('Jonas');
        expect(list.items[1].values().name).toBe('Jonny');
        done();
      });
      fireClick($('#sort-name')[0]);
    });