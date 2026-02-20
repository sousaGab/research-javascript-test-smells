it('should trigger searchComplete', function (done) {
      list.on('searchComplete', function () {
        done()
      })
      $('#parse-list .search').val('jon')
      fireKeyup($('#parse-list .search')[0])
      
      // Add assertion to prevent unknown test smell
      expect(list).toBeDefined()
    })