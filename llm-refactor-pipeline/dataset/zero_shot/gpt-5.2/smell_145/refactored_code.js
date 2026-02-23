it('should switch sorting order when clicking multiple times', function (done) {
  function assertState(isAsc, isDesc) {
    expect($('#sort-name').hasClass('asc')).toBe(isAsc)
    expect($('#sort-name').hasClass('desc')).toBe(isDesc)
  }

  function onceSortComplete() {
    return new Promise(function (resolve) {
      list.one('sortComplete', function () {
        resolve()
      })
    })
  }

  function clickAndWaitForSort() {
    var p = onceSortComplete()
    fireClick($('#sort-name')[0])
    return p
  }

  assertState(false, false)

  clickAndWaitForSort()
    .then(function () {
      assertState(true, false)
      return clickAndWaitForSort()
    })
    .then(function () {
      assertState(false, true)
      return clickAndWaitForSort()
    })
    .then(function () {
      assertState(true, false)
      done()
    })
    .catch(done)
})