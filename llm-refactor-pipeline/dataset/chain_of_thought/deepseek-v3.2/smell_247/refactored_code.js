it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  
  const originalNetConnectEnabled = nock.isActive()
  
  nockBackWithFixtureLocalhost(() => {
    const netConnectEnabled = nock.isActive()
    expect(netConnectEnabled).toBe(true)
    expect(netConnectEnabled).not.toBe(originalNetConnectEnabled)
    done()
  })
})