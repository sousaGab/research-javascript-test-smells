it('emits no match when no match and no mock', done => {
  nock.emitter.once('no match', () => {
    done()
  })

  http.get('http://example.test/abc').once('error', (error) => {
    expect(error).toBeDefined();
    expect(error.message).toBe('No match');
    done();
  })
})