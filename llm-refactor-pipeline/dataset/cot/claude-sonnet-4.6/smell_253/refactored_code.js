it('should trigger searchComplete', function (done) {
      list.on('searchComplete', function () {
        var visibleItems = list.visibleItems
        expect(visibleItems).toBeDefined()
        expect(visibleItems.length).toBeGreaterThan(0)
        visibleItems.forEach(function (item) {
          expect(item.values().name.toLowerCase()).toContain('angelica')
        })
        done()
      })
      $('#list-fuzzy-search .fuzzy-search').val('angelica')
      fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])
    })