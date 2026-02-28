it('socket has write() method', done => {
  nock('http://example.test').get('/').reply(200, 'hey');

  const req = http.get('http://example.test');

  req.once('socket', socket => {
    expect(socket).toBeDefined();
    expect(typeof socket.write).toBe('function');

    const result = socket.write('test');
    expect(typeof result).toBe('boolean');

    req.destroy();
    done();
  });
});