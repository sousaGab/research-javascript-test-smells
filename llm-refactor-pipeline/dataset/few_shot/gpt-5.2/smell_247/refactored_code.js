it('should enable net connect', done => {
  nock.disableNetConnect();
  nockBack.setMode('wild');

  const originalEnableNetConnect = nock.enableNetConnect;
  let enableNetConnectCalled = false;

  nock.enableNetConnect = (...args) => {
    enableNetConnectCalled = true;
    return originalEnableNetConnect.apply(nock, args);
  };

  const wrappedDone = err => {
    nock.enableNetConnect = originalEnableNetConnect;
    expect(enableNetConnectCalled).toBe(true);
    done(err);
  };

  nockBackWithFixtureLocalhost(wrappedDone);
});