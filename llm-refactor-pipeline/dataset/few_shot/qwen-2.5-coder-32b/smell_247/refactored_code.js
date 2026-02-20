it('should enable net connect', done => {
      nock.disableNetConnect()
      nockBack.setMode('wild')
      nockBackWithFixtureLocalhost(() => {
        // Verify net connect is enabled by attempting a simple request
        fetch('http://httpbin.org/get')
          .then(response => {
            expect(response.ok).toBe(true)
            done()
          })
          .catch(error => {
            done.fail(error)
          })
      })
    })