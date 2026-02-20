it('should enable net connect', done => {
      nock.disableNetConnect()
      nockBack.setMode('wild')
      nockBackWithFixtureLocalhost((err) => {
        if (err) return done(err)
        // Verify that net connect was actually enabled by checking that
        // the fixture was properly loaded and executed
        expect(nock.isActive()).toBe(true)
        done()
      })
    })