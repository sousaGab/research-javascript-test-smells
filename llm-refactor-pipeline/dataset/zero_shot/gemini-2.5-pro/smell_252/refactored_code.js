it('should trigger sortComplete', function (done) {
      list.on('sortComplete', function () {
        // Explicitly assert that the event handler was called.
        assert.ok(true, 'sortComplete event was triggered');
        done();
      });
      fireClick($('#sort-name')[0]);
    });