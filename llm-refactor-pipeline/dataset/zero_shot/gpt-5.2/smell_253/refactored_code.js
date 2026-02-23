it('should trigger searchComplete', function (done) {
  let triggered = false

  list.on('searchComplete', function () {
    triggered = true
  })

  $('#list-fuzzy-search .fuzzy-search').val('angelica')
  fireKeyup($('#list-fuzzy-search .fuzzy-search')[0])

  setTimeout(function () {
    expect(triggered).to.equal(true)
    done()
  }, 0)
})