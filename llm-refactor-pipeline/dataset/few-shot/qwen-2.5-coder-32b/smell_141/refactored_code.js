it('prevents the request from completing', done => {
      const onRequest = sinon.spy()

      const pendingRequest = nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK')

      http.get('http://example.test', onRequest)

      const timeoutId = setTimeout(() => {
        expect(onRequest).not.to.have.been.called()
        done()
      }, 200)
      
      const cleanup = () => {
        clearTimeout(timeoutId)
        nock.abortPendingRequests()
      }
      
      // Clean up on test completion
      process.nextTick(cleanup)
    })