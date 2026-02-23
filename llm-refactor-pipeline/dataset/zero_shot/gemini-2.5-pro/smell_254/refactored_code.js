it('should be triggered before and after filter', function (done) {
  const eventOrder = [];
  list.on('filterStart', function () {
    eventOrder.push('filterStart');
  });
  list.on('filterComplete', function () {
    eventOrder.push('filterComplete');
    expect(eventOrder).toEqual(['filterStart', 'filterComplete']);
    done();
  });
  list.filter(function () {
    return true;
  });
});