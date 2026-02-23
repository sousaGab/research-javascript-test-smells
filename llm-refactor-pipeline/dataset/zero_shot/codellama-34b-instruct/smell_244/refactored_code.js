// Your COMPLETE refactored test code here

it('emits no match when no match and no mock', done => {
  nock.emitter.once('no match', () => {
    expect(nock.emitter.listenerCount('no match')).toBe(1);
    done();
  });

  http.get('http://example.test/abc').once('error', ignore);
});