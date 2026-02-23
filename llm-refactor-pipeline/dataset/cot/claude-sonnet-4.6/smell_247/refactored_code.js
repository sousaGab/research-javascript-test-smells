it('should enable net connect', done => {
      nock.disableNetConnect()
      nockBack.setMode('wild')
      // TODO: It would be nice if there were a cleaner way to assert that net
      // connect is allowed.
      expect(nock.isActive()).toBe(true)
      expect(nockBack.currentMode).toBe('wild')
      nockBackWithFixtureLocalhost((err) => {
        expect(err).toBeFalsy()
        done(err)
      })
    })