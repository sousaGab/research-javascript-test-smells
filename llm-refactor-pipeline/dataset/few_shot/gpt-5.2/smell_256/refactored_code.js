it('should trigger both handlers', function (done) {
  let callCount = 0;

  const handler1 = function () {
    callCount += 1;
  };
  const handler2 = function () {
    callCount += 1;
  };

  list.on('updated', handler1);
  list.on('updated', handler2);

  list.search('jonny');

  setImmediate(function () {
    try {
      expect(callCount).toBe(2);
      done();
    } catch (err) {
      done(err);
    }
  });
});