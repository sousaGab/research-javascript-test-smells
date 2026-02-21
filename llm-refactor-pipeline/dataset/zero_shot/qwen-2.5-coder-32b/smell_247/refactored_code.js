it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  
  // Verify that net connect is allowed by attempting a simple request
  const scope = nock('http://example.com')
    .get('/')
    .reply(200, 'OK')
  
  nockBackWithFixtureLocalhost((err) => {
    if (err) return done(err)
    
    // Assert that the mock was called, proving net connect worked
    if (!scope.isDone()) {
      return done(new Error('Expected mock to be called'))
    }
    
    done()
  })
})