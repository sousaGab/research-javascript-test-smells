it('should trigger searchComplete', function (done) {
  let searchCompleteTriggered = false;
  
  list.on('searchComplete', function () {
    searchCompleteTriggered = true;
    expect(searchCompleteTriggered).to.be.true;
    done();
  });
  
  $('#parse-list .search').val('jon');
  fireKeyup($('#parse-list .search')[0]);
});