it('should trigger searchComplete', function (done) {
      list.on('searchComplete', function (updatedList) {
        expect(updatedList.matchingItems.length).toBe(2);
        done();
      });
      $('#parse-list .search').val('jon');
      fireKeyup($('#parse-list .search')[0]);
    });