it('should trigger searchComplete', function (done) {
      list.on('searchComplete', function () {
        done()
      })
      $('#parse-list .search').val('jon')
      fireKeyup($('#parse-list .search')[0])
      expect($('#parse-list .search').val()).toBe('jon')
    })