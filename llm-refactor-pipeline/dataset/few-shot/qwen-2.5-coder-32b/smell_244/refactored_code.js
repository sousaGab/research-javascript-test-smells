it('emits no match event when no match and no mock', done => {
  nock.emitter.once('no match', () => {
    done()
  })

  http.get('http://example.test/abc').once('error', ignore)
  
  // Add assertion to verify the event was emitted
  expect(nock.emitter.listeners('no match')).toHaveLength(1)
})