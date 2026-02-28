it('should trigger searchComplete with correct search term', function (done) {
  list.on('searchComplete', function (data) {
    expect(data).toBe('angelica');
    done();
  });
  $('#list-fuzzy-search .fuzzy-search').val('angelica');
  fireKeyup($('#list-fuzzy-search .fuzzy-search')[0]);
});