it('prevents the request from completing', done => {
      const onRequest = sinon.spy()

      nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK')

      http.get('http://example.test', onRequest)

      setImmediate(() => {
        nock.abortPendingRequests()
        expect(onRequest).not.to.have.been.called()
        done()
      })
    })