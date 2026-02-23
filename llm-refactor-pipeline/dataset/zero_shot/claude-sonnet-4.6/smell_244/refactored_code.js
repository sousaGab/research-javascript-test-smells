it('emits no match when no match and no mock', done => {
  nock.emitter.once('no match', (req) => {
    expect(req).toBeDefined()
    done()
  })

  http.get('http://example.test/abc').once('error', ignore)
})