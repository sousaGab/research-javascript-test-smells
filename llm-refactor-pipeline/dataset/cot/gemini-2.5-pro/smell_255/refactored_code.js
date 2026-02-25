it('should be triggered before and after sort', function (done) {
      const eventsFired = [];
      list.on('sortStart', function () {
        eventsFired.push('sortStart');
      });
      list.on('sortComplete', function () {
        eventsFired.push('sortComplete');
        expect(eventsFired).toEqual(['sortStart', 'sortComplete']);
        done();
      });
      list.sort('name');
    });