it('prevents the request from completing', done => {
  const onRequest = sinon.spy()

  const scope = nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK')

  http.get('http://example.test', onRequest)

  // Use nock's built-in timing control instead of setTimeout
  scope.on('request', () => {
    // Verify request hasn't completed yet
    expect(onRequest).not.to.have.been.called()
    done()
  })
  
  // Abort pending requests after a short delay to clean up
  setImmediate(() => {
    nock.abortPendingRequests()
  })
})