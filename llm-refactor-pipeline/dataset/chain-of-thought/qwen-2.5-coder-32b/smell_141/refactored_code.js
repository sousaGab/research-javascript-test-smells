it('prevents the request from completing', () => {
  const onRequest = sinon.spy()

  nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK')

  http.get('http://example.test', onRequest)

  return new Promise(resolve => {
    setImmediate(() => {
      expect(onRequest).not.to.have.been.called()
      resolve()
    })
  })
})