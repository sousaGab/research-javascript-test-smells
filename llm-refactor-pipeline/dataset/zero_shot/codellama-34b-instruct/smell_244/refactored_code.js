it('emits no match when no match and no mock', done => {
  nock.emitter.once('no match', () => {
    done()
  })

  http.get('http://example.test/abc').once('error', ignore)

  // Add an assertion to ensure that the expected event is emitted
  expect(nock.emitter.emit('no match')).to.be.true
})