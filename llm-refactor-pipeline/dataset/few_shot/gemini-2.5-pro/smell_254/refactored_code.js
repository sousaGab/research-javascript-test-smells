it('should be triggered before and after filter', function (done) {
      let filterStartFired = false;
      list.on('filterStart', function () {
        filterStartFired = true;
      });
      list.on('filterComplete', function () {
        expect(filterStartFired).toBe(true);
        done();
      });
      list.filter(function () {
        return true;
      });
    });