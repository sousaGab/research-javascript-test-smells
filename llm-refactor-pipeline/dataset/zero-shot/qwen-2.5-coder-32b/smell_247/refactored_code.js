it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  
  const originalEnableNetConnect = nock.enableNetConnect
  const originalNockBack = nockBackWithFixtureLocalhost
  
  // Mock enableNetConnect to track if it's called
  let enableNetConnectCalled = false
  nock.enableNetConnect = function() {
    enableNetConnectCalled = true
    return originalEnableNetConnect.apply(this, arguments)
  }
  
  // Execute the test
  originalNockBack(() => {
    expect(enableNetConnectCalled).toBe(true)
    done()
  })
})