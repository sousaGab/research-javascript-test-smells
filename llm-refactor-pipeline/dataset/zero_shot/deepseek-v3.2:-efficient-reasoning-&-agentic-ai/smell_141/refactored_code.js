it('prevents the request from completing', done => {
  const onRequest = sinon.spy()

  nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK')

  http.get('http://example.test', onRequest)

  setImmediate(nock.abortPendingRequests)

  const checkRequestNotCalled = () => {
    if (onRequest.called) {
      done(new Error('Request callback was called unexpectedly'))
    } else {
      done()
    }
  }

  setTimeout(checkRequestNotCalled, 0)
})