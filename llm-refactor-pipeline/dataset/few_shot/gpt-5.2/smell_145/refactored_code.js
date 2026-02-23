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

  function clickSortName() {
    fireClick($('#sort-name')[0])
  }

  list.on('sortComplete', function () {
    sortRun++

    if (sortRun === 1) {
      assertAsc()
      clickSortName()
    } else if (sortRun === 2) {
      assertDesc()
      clickSortName()
    } else if (sortRun === 3) {
      assertAsc()
      done()
    }
  })

  expect($('#sort-name').hasClass('asc')).toBe(false)
  expect($('#sort-name').hasClass('desc')).toBe(false)

  clickSortName()
})