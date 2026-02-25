it('should trigger searchComplete and find a matching item', function (done) {
      list.on('searchComplete', function () {
        expect(list.visibleItems.length).to.equal(1)
        expect(list.visibleItems[0].values().name).to.equal('Angelica')
        done()
      })
      $('#list-fuzzy-search .fuzzy-search').val('angelica')
      fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])
    })