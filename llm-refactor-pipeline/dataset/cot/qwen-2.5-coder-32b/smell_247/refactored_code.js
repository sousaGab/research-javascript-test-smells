it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  
  // Verify that net connect is enabled by checking that requests can be made
  const scope = nock('http://localhost')
    .get('/test')
    .reply(200, 'success')
  
  nockBackWithFixtureLocalhost((err, result) => {
    if (err) return done(err)
    
    // Assert that the request was successful
    expect(scope.isDone()).toBe(true)
    done()
  })
})