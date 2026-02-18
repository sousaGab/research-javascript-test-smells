it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  
  const originalNetConnect = nock.enableNetConnect
  nock.enableNetConnect = jest.fn()
  
  nockBackWithFixtureLocalhost(() => {
    expect(nock.enableNetConnect).toHaveBeenCalled()
    nock.enableNetConnect = originalNetConnect
    done()
  })
})