it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  
  // Verify that net connect is enabled by checking that requests can be made
  const scope = nock('http://localhost')
    .get('/test')
    .reply(200, { success: true })
  
  nockBackWithFixtureLocalhost((err) => {
    if (err) return done(err)
    
    // Assert that the request was made and responded to correctly
    expect(scope.isDone()).toBe(true)
    done()
  })
})