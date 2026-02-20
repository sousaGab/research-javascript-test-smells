it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  nockBackWithFixtureLocalhost(done)
  expect(nock.isNetConnectAllowed()).toBe(true)
})