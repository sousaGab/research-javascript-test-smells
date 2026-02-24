it('should trigger searchComplete', function (done) {
  let eventTriggered = false

  list.on('searchComplete', function () {
    eventTriggered = true
    expect(eventTriggered).toBe(true)
    done()
  })

  $('#parse-list .search').val('jon')
  fireKeyup($('#parse-list .search')[0])
})