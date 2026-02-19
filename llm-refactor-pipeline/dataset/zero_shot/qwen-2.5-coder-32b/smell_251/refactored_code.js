it('should trigger searchComplete', function (done) {
      list.on('searchComplete', function () {
        expect(true).toBe(true);
        done()
      })
      $('#parse-list .search').val('jon')
      fireKeyup($('#parse-list .search')[0])
    })