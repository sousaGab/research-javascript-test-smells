it('emits no match when no match and no mock', done => {
  let noMatchEmitted = false

  nock.emitter.once('no match', () => {
    noMatchEmitted = true
  })

  http.get('http://example.test/abc')
    .once('error', ignore)
    .once('close', () => {
      try {
        if (!noMatchEmitted) throw new Error('Expected "no match" event to be emitted')
        done()
      } catch (err) {
        done(err)
      }
    })
})