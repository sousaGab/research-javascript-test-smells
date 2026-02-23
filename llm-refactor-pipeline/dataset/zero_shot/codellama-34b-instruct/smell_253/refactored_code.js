// Your COMPLETE refactored test code here
it('should trigger searchComplete', function (done) {
  list.on('searchComplete', function () {
    expect(list.searchComplete).toHaveBeenCalled();
    done();
  })
  $('#list-fuzzy-search .fuzzy-search').val('angelica')
  fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])
})