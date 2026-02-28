it('should be trigger both handlers', function (done) {
      let callCount = 0;
      const expectedCalls = 2;

      const handler = function () {
        callCount++;
        if (callCount === expectedCalls) {
          expect(callCount).toBe(expectedCalls);
          done();
        }
      };

      list.on('updated', handler);
      list.on('updated', handler);

      list.search('jonny');
    })