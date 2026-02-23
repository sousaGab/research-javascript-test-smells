it('should trigger searchComplete', function (done) {
  let called = false;

  list.on('searchComplete', function () {
    called = true;
    expect(called).toBe(true);
    done();
  });

  $('#list-fuzzy-search .fuzzy-search').val('angelica');
  fireKeyup($('#list-fuzzy-search .fuzzy-search')[0]);
});