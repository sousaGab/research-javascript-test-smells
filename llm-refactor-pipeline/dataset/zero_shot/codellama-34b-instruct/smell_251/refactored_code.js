it('should trigger searchComplete', function (done) {
  list.on('searchComplete', function () {
    expect(list.searchComplete).toBe(true);
    done();
  });
  $('#parse-list .search').val('jon');
  fireKeyup($('#parse-list .search')[0]);
});