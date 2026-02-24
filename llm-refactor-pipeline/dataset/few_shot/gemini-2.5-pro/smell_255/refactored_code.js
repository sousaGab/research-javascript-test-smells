it('should be triggered before and after sort', function (done) {
      const eventOrder = [];
      list.on('sortStart', function (list) {
        eventOrder.push('sortStart');
      });
      list.on('sortComplete', function (list) {
        eventOrder.push('sortComplete');
        expect(eventOrder).toEqual(['sortStart', 'sortComplete']);
        done();
      });
      list.sort('name');
    })