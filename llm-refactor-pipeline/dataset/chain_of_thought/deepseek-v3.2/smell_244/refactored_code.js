it('emits no match when no match and no mock', done => {
  let noMatchEmitted = false;
  
  nock.emitter.once('no match', () => {
    noMatchEmitted = true;
    done();
  });

  http.get('http://example.test/abc').once('error', ignore);
  
  // Verify the event was emitted
  setTimeout(() => {
    expect(noMatchEmitted).toBe(true);
  }, 100);
});