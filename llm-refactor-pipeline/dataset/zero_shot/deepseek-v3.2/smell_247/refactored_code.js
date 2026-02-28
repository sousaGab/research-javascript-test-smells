it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  
  const originalNetConnectState = nock.isActive()
  
  nockBackWithFixtureLocalhost(err => {
    if (err) return done(err)
    
    try {
      // Assert that net connect is now enabled by checking nock state
      expect(nock.isActive()).to.not.equal(originalNetConnectState)
      done()
    } catch (assertionError) {
      done(assertionError)
    }
  })
})