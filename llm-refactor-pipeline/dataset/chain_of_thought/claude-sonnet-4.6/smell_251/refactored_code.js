it('should trigger searchComplete', function (done) {
      let searchCompleted = false
      list.on('searchComplete', function () {
        searchCompleted = true
        expect(searchCompleted).toBe(true)
        expect(list.visibleItems).toBeDefined()
        done()
      })
      $('#parse-list .search').val('jon')
      fireKeyup($('#parse-list .search')[0])
    })