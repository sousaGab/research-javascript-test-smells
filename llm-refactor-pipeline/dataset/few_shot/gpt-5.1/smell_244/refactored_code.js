it('emits no match when no match and no mock', done => {
  const noMatchListener = jest.fn(() => {
    expect(noMatchListener).toHaveBeenCalledTimes(1)
    done()
  })

  nock.emitter.once('no match', noMatchListener)

  http.get('http://example.test/abc').once('error', ignore)
})