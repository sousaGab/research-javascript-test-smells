it('should trigger searchComplete', function (done) {
  const searchCompleteSpy = jasmine.createSpy('searchComplete');
  list.on('searchComplete', searchCompleteSpy);
  
  $('#parse-list .search').val('jon');
  fireKeyup($('#parse-list .search')[0]);
  
  setTimeout(() => {
    expect(searchCompleteSpy).toHaveBeenCalled();
    done();
  }, 0);
})