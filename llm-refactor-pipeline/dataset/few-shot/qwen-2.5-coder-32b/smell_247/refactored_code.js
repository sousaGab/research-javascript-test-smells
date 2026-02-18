it('should enable net connect', done => {
      nock.disableNetConnect()
      nockBack.setMode('wild')
      nockBackWithFixtureLocalhost(() => {
        // Verify that net connect is actually enabled by making a simple request
        fetch('http://httpbin.org/get')
          .then(response => {
            expect(response.status).toBe(200)
            done()
          })
          .catch(error => {
            done.fail(error)
          })
      })
    })