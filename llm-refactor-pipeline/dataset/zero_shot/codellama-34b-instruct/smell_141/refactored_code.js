// Your COMPLETE refactored test code here
it('prevents the request from completing', done => {
  const onRequest = sinon.spy()

  nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK')

  http.get('http://example.test', onRequest)

  setTimeout(() => {
    expect(onRequest).not.to.have.been.called()
    done()
  }, 200)
  setImmediate(nock.abortPendingRequests)
})