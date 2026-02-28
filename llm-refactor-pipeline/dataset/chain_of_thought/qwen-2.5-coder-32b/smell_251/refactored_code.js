it('should trigger searchComplete with correct search term', function (done) {
  list.on('searchComplete', function (searchTerm) {
    expect(searchTerm).toBe('jon');
    done();
  });
  $('#parse-list .search').val('jon');
  fireKeyup($('#parse-list .search')[0]);
});