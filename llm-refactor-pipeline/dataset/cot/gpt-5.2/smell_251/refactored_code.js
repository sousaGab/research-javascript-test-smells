// Your COMPLETE refactored test code here
it('should trigger searchComplete', function (done) {
  let called = false;

  list.on('searchComplete', function () {
    called = true;
    expect(called).toBe(true);
    done();
  });

  $('#parse-list .search').val('jon');
  fireKeyup($('#parse-list .search')[0]);
});