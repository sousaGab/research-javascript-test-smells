it('emits no match when no match and no mock', done => {
  expect.assertions(1)

  nock.emitter.once('no match', () => {
    expect(true).toBe(true)
    done()
  })

  http.get('http://example.test/abc').once('error', ignore)
})