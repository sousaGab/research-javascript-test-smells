it('prevents the request from completing', done => {
  const onRequest = sinon.spy()

  nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK')

  http.get('http://example.test', onRequest)

  const checkRequestNotCalled = () => {
    expect(onRequest).not.to.have.been.called()
    done()
  }

  const requestCheckInterval = setInterval(() => {
    if (nock.isDone()) {
      clearInterval(requestCheckInterval)
      checkRequestNotCalled()
    }
  }, 10)

  setImmediate(nock.abortPendingRequests)
})