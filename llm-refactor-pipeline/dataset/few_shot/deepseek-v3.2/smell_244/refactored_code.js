it('emits no match when no match and no mock', done => {
  nock.emitter.once('no match', () => {
    done()
  })

  http.get('http://example.test/abc').once('error', ignore)
  
  expect(nock.emitter.listenerCount('no match')).toBeGreaterThan(0)
})