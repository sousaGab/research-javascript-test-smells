it('Emits the expected event sequence when `write` is called on an aborted request', done => {
  const scope = nock('http://example.test').get('/').reply();

  const req = http.request('http://example.test');
  const emitSpy = sinon.spy(req, 'emit');

  let closeEmitted = false;
  let abortEmitted = false;

  function assertAndFinish() {
    if (!closeEmitted || !abortEmitted) return;

    expect(emitSpy).to.have.been.calledTwice();
    expect(emitSpy.firstCall).to.have.been.calledWith('close');
    expect(emitSpy.secondCall).to.have.been.calledWith('abort');
    expect(scope.isDone()).to.be.false();
    done();
  }

  req.once('close', () => {
    closeEmitted = true;
    assertAndFinish();
  });

  req.once('abort', () => {
    abortEmitted = true;
    assertAndFinish();
  });

  req.abort();
  req.write('foo');
});