it('emits no match when no match and no mock', done => {
  let noMatchEmitted = false;

  nock.emitter.once('no match', () => {
    noMatchEmitted = true;
  });

  http.get('http://example.test/abc')
    .once('error', ignore)
    .once('close', () => {
      expect(noMatchEmitted).toBe(true);
      done();
    });
});