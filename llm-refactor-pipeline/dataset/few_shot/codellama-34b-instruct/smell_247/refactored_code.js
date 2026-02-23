// Your COMPLETE refactored test code here

it('should enable net connect', done => {
      nock.disableNetConnect()
      nockBack.setMode('wild')
      // TODO: It would be nice if there were a cleaner way to assert that net
      // connect is allowed.
      nockBackWithFixtureLocalhost(done)
    })