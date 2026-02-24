it('should trigger both handlers', function (done) {
      let handler1Called = false;
      let handler2Called = false;

      const checkCompletion = () => {
        if (handler1Called && handler2Called) {
          expect(handler1Called).toBe(true);
          expect(handler2Called).toBe(true);
          done();
        }
      };

      list.on('updated', function () {
        handler1Called = true;
        checkCompletion();
      });

      list.on('updated', function () {
        handler2Called = true;
        checkCompletion();
      });

      list.search('jonny');
    });