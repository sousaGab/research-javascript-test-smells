it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  
  // Verify that net connect is allowed by checking that the callback is called
  // with a successful response or by ensuring no exceptions occur
  nockBackWithFixtureLocalhost((err, result) => {
    if (err) {
      return done(err)
    }
    // If we get here without error, net connect was properly enabled
    expect(result).to.exist
    done()
  })
})