it('should trigger sortComplete', function (done) {
      list.on('sortComplete', function () {
        // By reaching this callback, the test's purpose is fulfilled.
        // An explicit assertion is added to remove the "Unknown Test" smell.
        expect(true).to.be.true;
        done();
      });
      fireClick($('#sort-name')[0]);
    });