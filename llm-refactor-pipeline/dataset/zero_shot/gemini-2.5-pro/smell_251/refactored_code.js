it('should trigger searchComplete', function (done) {
  list.on('searchComplete', function () {
    expect(list.visibleItems.length).to.equal(1);
    done();
  });
  $('#parse-list .search').val('jon');
  fireKeyup($('#parse-list .search')[0]);
});