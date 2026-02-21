it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')
  const fixture = nockBackWithFixtureLocalhost(done)
  expect(fixture.netConnect).toBe(true)
  done()
})