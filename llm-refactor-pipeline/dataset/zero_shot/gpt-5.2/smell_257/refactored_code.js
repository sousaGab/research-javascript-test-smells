it('should be triggered after add', function (done) {
  let called = false

  list.on('updated', function (updatedList) {
    called = true
    if (updatedList !== list) return done(new Error('updated event did not pass the list instance'))
    done()
  })

  list.add({ name: 'Hej' })

  setTimeout(function () {
    if (!called) done(new Error('updated event was not triggered after add'))
  }, 0)
})