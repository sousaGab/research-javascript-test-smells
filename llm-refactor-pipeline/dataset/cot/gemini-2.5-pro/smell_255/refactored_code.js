it('should be triggered before and after sort', function (done) {
      var sortStartFired = false;

      list.on('sortStart', function () {
        sortStartFired = true;
      });

      list.on('sortComplete', function () {
        expect(sortStartFired).toBe(true);
        done();
      });

      list.sort('name');
    });