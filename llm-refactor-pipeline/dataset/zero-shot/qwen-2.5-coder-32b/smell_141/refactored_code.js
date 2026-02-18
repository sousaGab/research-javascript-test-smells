it('prevents the request from completing', done => {
      const onRequest = sinon.spy()

      const scope = nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK')

      http.get('http://example.test', onRequest)

      setTimeout(() => {
        expect(onRequest).not.to.have.been.called()
        scope.done()
        done()
      }, 200)
    })