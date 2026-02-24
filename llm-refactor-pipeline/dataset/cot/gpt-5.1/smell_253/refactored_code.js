it('should trigger searchComplete when fuzzy search is performed', function (done) {
  let eventTriggered = false

  list.on('searchComplete', function () {
    eventTriggered = true
    expect(eventTriggered).toBe(true)
    done()
  })

  $('#list-fuzzy-search .fuzzy-search').val('angelica')
  fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])
})