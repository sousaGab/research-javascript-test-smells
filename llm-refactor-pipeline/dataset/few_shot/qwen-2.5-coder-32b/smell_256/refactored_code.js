it('should trigger both handlers', function (done) {
  var done1 = false,
    done2 = false,
    isDone = function () {
      if (done1 && done2) {
        done()
      }
    }

  const handler1 = jest.fn();
  const handler2 = jest.fn();

  list.on('updated', handler1);
  list.on('updated', handler2);
  
  list.search('jonny');

  // Verify both handlers were called
  setTimeout(() => {
    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
    done();
  }, 0);
});