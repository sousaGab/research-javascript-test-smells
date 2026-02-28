it('should trigger before and after sort', function (done) {
  var done1 = false
  list.on('sortStart', function (list) {
    done1 = true
  })
  list.on('sortComplete', function (list) {
    if (done1) {
      done()
    }
  })
  list.sort('name')
  expect(done1).toBe(true)
})