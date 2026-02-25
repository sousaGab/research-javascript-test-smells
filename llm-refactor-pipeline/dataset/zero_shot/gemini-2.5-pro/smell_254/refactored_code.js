it('should trigger filterStart before filterComplete', function (done) {
  let filterStartTriggered = false;

  list.on('filterStart', function () {
    filterStartTriggered = true;
  });

  list.on('filterComplete', function () {
    expect(filterStartTriggered).to.be.true;
    done();
  });

  list.filter(function () {
    return true;
  });
});