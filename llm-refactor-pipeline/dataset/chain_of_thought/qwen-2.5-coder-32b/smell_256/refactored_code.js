it('should trigger both handlers', function (done) {
  var done1 = false,
    done2 = false,
    isDone = function () {
      if (done1 && done2) {
        done()
      }
    }

  list.on('updated', function (list) {
    done1 = true
    isDone()
  })
  list.on('updated', function (list) {
    done2 = true
    isDone()
  })
  
  // Add assertion to verify the handlers were called
  const originalEmit = list.emit;
  list.emit = function(event, data) {
    if (event === 'updated') {
      // Verify that the event is emitted with correct data
      expect(data).toBeDefined();
    }
    return originalEmit.apply(this, arguments);
  };

  list.search('jonny')
})