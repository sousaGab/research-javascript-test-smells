it('should be triggered before and after sort', function (done) {
      let sortStarted = false;
      list.on('sortStart', function () {
        sortStarted = true;
      });
      list.on('sortComplete', function () {
        expect(sortStarted).toBe(true);
        done();
      });
      list.sort('name');
    });