// Your COMPLETE refactored test code here

it('should be triggered before and after filter', function (done) {
  var done1 = false
  list.on('filterStart', function (list) {
    done1 = true
  })
  list.on('filterComplete', function (list) {
    if (done1) {
      done()
    }
  })
  list.filter(function () {
    return true
  })
})