it('emits no match when no match and no mock', async () => {
  const promise = new Promise(resolve => {
    nock.emitter.once('no match', req => resolve(req));
  });

  http.get('http://example.test/abc').once('error', () => {
    // An error is expected for an unmocked request, so we can ignore it.
  });

  const req = await promise;
  expect(req.path).toBe('/abc');
});