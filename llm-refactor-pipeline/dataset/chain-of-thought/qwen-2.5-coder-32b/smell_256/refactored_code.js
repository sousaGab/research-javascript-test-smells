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
  
  const spy1 = spyOn(list, 'on').and.callThrough();
  const spy2 = spyOn(list, 'on').and.callThrough();
  
  list.search('jonny')
  
  expect(spy1).toHaveBeenCalledWith('updated', jasmine.any(Function));
  expect(spy2).toHaveBeenCalledWith('updated', jasmine.any(Function));
})