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
  
  // Add explicit assertion to verify the handlers were called
  const originalEmit = list.emit;
  let emitCalls = [];
  
  list.emit = function(event, data) {
    emitCalls.push({ event, data });
    return originalEmit.apply(this, arguments);
  };
  
  list.search('jonny');
  
  // Verify that the 'updated' event was emitted twice
  expect(emitCalls.filter(call => call.event === 'updated')).to.have.lengthOf(2);
})