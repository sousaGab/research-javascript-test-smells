it('socket has write() method', done => {
  nock('http://example.test').get('/').reply(200, 'hey');

  const req = http.get('http://example.test');
  req.once('socket', socket => {
    // Assert that the `write` method exists and does not throw when called.
    // This makes the implicit check of the original test explicit.
    expect(() => socket.write('test')).to.not.throw();
    done();
  });
});