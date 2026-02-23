it('should enable net connect', done => {
      nock.disableNetConnect()
      nockBack.setMode('wild')
      nockBackWithFixtureLocalhost((err) => {
        expect(err).toBeUndefined()
        expect(nock.isActive()).toBe(true)
        done()
      })
    })