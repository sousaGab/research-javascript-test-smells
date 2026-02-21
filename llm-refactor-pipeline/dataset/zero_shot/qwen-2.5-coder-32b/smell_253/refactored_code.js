it('should trigger searchComplete', function (done) {
  const searchCompleteSpy = jasmine.createSpy('searchComplete');
  list.on('searchComplete', searchCompleteSpy);
  
  $('#list-fuzzy-search .fuzzy-search').val('angelica');
  fireKeyup($('#list-fuzzy-search .fuzzy-search')[0]);
  
  setTimeout(() => {
    expect(searchCompleteSpy).toHaveBeenCalled();
    done();
  }, 0);
})