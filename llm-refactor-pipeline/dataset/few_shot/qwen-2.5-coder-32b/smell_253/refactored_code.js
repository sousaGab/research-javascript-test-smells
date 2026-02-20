it('should trigger searchComplete', function (done) {
      let callbackCalled = false;
      
      list.on('searchComplete', function () {
        callbackCalled = true;
        done()
      })
      
      $('#list-fuzzy-search .fuzzy-search').val('angelica')
      fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])
      
      // Add assertion to verify the callback was called
      expect(callbackCalled).toBe(true);
    })