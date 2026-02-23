it('should switch sorting order when clicking multiple times', function (done) {
  var sortRun = 0

  function assertAsc() {
    expect($('#sort-name').hasClass('asc')).toBe(true)
    expect($('#sort-name').hasClass('desc')).toBe(false)
  }

  function assertDesc() {
    expect($('#sort-name').hasClass('asc')).toBe(false)
    expect($('#sort-name').hasClass('desc')).toBe(true)
  }

  list.on('sortComplete', function () {
    sortRun++

    if (sortRun === 1) {
      assertAsc()
      fireClick($('#sort-name')[0])
    } else if (sortRun === 2) {
      assertDesc()
      fireClick($('#sort-name')[0])
    } else if (sortRun === 3) {
      assertAsc()
      done()
    }
  })

  expect($('#sort-name').hasClass('asc')).toBe(false)
  expect($('#sort-name').hasClass('desc')).toBe(false)

  fireClick($('#sort-name')[0])
})