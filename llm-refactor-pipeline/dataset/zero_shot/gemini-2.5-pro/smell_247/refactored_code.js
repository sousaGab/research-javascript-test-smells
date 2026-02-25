it('should enable net connect', done => {
      nock.disableNetConnect()
      nockBack.setMode('wild')

      nockBackWithFixtureLocalhost(err => {
        if (err) {
          return done(err)
        }
        // Assert that net connect is allowed after nockBack runs in 'wild' mode.
        expect(nock.isNetConnectAllowed()).to.be.true()
        done()
      })
    })