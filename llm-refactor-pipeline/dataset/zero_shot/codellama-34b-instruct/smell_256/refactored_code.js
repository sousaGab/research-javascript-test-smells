it('should be trigger both handlers', function (done) {
  var done1 = false,
    done2 = false,
    isDone = function () {
      if (done1 && done2) {
        done()
      }
    }

  list.on('updated', function (list) {
    done1 = true
    isDone()
  })
  list.on('updated', function (list) {
    done2 = true
    isDone()
  })
  list.search('jonny')

  // Add assertions to ensure that the expected behavior is being tested
  expect(list.length).to.equal(2)
  expect(list[0].name).to.equal('Jonny')
  expect(list[1].name).to.equal('Jonny')
})