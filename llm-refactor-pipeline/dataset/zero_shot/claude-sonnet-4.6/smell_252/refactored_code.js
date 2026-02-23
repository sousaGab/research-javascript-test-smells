it('should trigger sortComplete', function (done) {
      list.on('sortComplete', function (list, item) {
        expect(list).toBeDefined();
        done();
      });
      fireClick($('#sort-name')[0]);
    })