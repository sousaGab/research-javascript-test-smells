it('prevents the request from completing', done => {
      const onRequest = sinon.spy()

      nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK')

      const req = http.get('http://example.test', onRequest)

      req.on('error', error => {
        expect(error.code).to.equal('ECONNRESET')
        expect(onRequest).not.to.have.been.called()
        done()
      })

      nock.abortPendingRequests()
    })