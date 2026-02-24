it('should trigger searchComplete', function (done) {
  let eventTriggered = false

  list.on('searchComplete', function () {
    eventTriggered = true
    try {
      expect(eventTriggered).to.be.true
      done()
    } catch (err) {
      done(err)
    }
  })

  $('#list-fuzzy-search .fuzzy-search').val('angelica')
  fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])

  setTimeout(function () {
    if (!eventTriggered) {
      done(new Error('searchComplete event was not triggered'))
    }
  }, 100)
})