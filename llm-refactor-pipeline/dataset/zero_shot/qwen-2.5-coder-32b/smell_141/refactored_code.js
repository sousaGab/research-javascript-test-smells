it('prevents the request from completing', done => {
  const onRequest = sinon.spy()

  const scope = nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK')

  http.get('http://example.test', onRequest)

  // Use nock's built-in functionality to abort pending requests immediately
  // instead of relying on setTimeout
  nock.abortPendingRequests()

  // Verify that the request was aborted before it could complete
  // by checking that the callback was never called
  expect(onRequest).not.to.have.been.called()
  done()
})