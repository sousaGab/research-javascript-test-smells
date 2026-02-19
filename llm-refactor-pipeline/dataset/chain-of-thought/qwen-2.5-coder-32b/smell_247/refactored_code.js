it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  
  // Assert that net connect is allowed by verifying the behavior
  const originalNetConnect = nock.hasNetConnect()
  expect(originalNetConnect).toBe(true)
  
  nockBackWithFixtureLocalhost(done)
})