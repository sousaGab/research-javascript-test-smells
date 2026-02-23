it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')

  // In "wild" mode, nock.back enables net connect for the scope of its callback.
  // We can assert this state directly, which is more explicit than relying on
  // a network call to not throw an error.
  nockBack('fixture.json', function (nockDone) {
    expect(nock.isNetConnectAllowed()).to.be.true
    nockDone()
    done()
  })
})