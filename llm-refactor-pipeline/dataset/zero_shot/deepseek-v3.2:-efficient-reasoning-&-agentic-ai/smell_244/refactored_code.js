it('emits no match when no match and no mock', done => {
  let eventEmitted = false
  
  nock.emitter.once('no match', () => {
    eventEmitted = true
    done()
  })

  http.get('http://example.test/abc').once('error', ignore)
  
  // Add assertion to verify the event was emitted
  setTimeout(() => {
    if (!eventEmitted) {
      done(new Error('Expected "no match" event to be emitted but it was not'))
    }
  }, 100)
})