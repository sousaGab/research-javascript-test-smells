it('should enable net connect', done => {
  nock.disableNetConnect();
  nockBack.setMode('wild');

  const originalRequest = globalThis.XMLHttpRequest;

  nockBackWithFixtureLocalhost(err => {
    try {
      expect(err).toBeFalsy();
      expect(nock.isActive()).toBe(true);
      expect(nock.isDone()).toBe(true);
      expect(globalThis.XMLHttpRequest).toBe(originalRequest);
      done();
    } catch (assertionError) {
      done(assertionError);
    }
  });
});