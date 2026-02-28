it('should be triggered before and after sort', function (done) {
  let sortStartCalled = false;
  let sortCompleteCalled = false;

  list.on('sortStart', function (list) {
    sortStartCalled = true;
  });

  list.on('sortComplete', function (list) {
    sortCompleteCalled = true;
    expect(sortStartCalled).to.be.true;
    expect(sortCompleteCalled).to.be.true;
    done();
  });

  list.sort('name');
});