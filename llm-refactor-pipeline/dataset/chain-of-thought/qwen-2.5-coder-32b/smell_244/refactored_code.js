it('emits no match when no match and no mock', done => {
  const spy = jest.fn()
  nock.emitter.once('no match', spy)

  http.get('http://example.test/abc').once('error', ignore)

  // Wait a bit to allow event to be emitted
  setTimeout(() => {
    expect(spy).toHaveBeenCalled()
    done()
  }, 10)
})