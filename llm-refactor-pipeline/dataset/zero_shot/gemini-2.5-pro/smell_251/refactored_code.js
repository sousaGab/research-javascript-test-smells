it('should trigger searchComplete', function (done) {
      list.on('searchComplete', function (list) {
        expect(list.matchingItems.length).to.equal(1);
        done();
      });
      $('#parse-list .search').val('jon');
      fireKeyup($('#parse-list .search')[0]);
    });