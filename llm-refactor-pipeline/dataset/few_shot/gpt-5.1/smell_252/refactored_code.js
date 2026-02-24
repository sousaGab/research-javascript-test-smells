it('should trigger sortComplete', function (done) {
  let sortCompleteTriggered = false

  list.on('sortComplete', function () {
    sortCompleteTriggered = true
    expect(sortCompleteTriggered).toBe(true)
    done()
  })

  fireClick($('#sort-name')[0])
})