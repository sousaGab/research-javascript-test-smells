it('should be triggered before and after sort', function (done) {
  var sortStartTriggered = false
  var sortCompleteTriggered = false

  list.on('sortStart', function () {
    sortStartTriggered = true
  })

  list.on('sortComplete', function () {
    sortCompleteTriggered = true
    try {
      expect(sortStartTriggered).to.be.true
      expect(sortCompleteTriggered).to.be.true
      done()
    } catch (err) {
      done(err)
    }
  })

  list.sort('name')
})