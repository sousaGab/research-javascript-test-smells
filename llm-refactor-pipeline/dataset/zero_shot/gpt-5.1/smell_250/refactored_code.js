it('can be called without a callback and times out the socket as expected', done => {
  const scope = nock('http://example.test')
    .get('/')
    .delayConnection(100)
    .reply(200);

  const req = http.get('http://example.test');

  req.on('socket', socket => {
    socket.setTimeout(50);

    socket.on('timeout', () => {
      expect(scope.isDone()).to.be.true;
      req.abort();
      done();
    });
  });

  req.on('error', err => {
    done(err);
  });
});