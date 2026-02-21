it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  
  // Verify that net connect is allowed by attempting a simple request
  const scope = nock('http://localhost')
    .get('/test')
    .reply(200, { success: true })
  
  nockBackWithFixtureLocalhost((err) => {
    if (err) return done(err)
    
    // Assert that the mock was called, confirming net connect is enabled
    expect(scope.isDone()).toBe(true)
    done()
  })
})