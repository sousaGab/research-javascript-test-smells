it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  
  // Verify that net connect is enabled by checking that a network request can be made
  const scope = nock('http://example.com')
    .get('/test')
    .reply(200, 'success')
  
  nockBackWithFixtureLocalhost((err, result) => {
    if (err) return done(err)
    
    // Assert that the network request was successful
    expect(scope.isDone()).to.be.true
    expect(result).to.exist
    
    done()
  })
})