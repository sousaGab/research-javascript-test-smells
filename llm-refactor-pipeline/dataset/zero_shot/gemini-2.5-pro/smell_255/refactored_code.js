it('should be triggered before and after sort', function (done) {
  const eventOrder = [];
  list.on('sortStart', function () {
    eventOrder.push('sortStart');
  });
  list.on('sortComplete', function () {
    eventOrder.push('sortComplete');
    expect(eventOrder).to.deep.equal(['sortStart', 'sortComplete']);
    done();
  });
  list.sort('name');
});