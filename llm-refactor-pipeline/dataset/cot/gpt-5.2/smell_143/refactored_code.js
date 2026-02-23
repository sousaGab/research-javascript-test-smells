it('Emits the expected event sequence when `flushHeaders` is called on an aborted request', done => {
  const scope = nock('http://example.test').get('/').reply()

  const req = http.request('http://example.test')
  const emitSpy = sinon.spy(req, 'emit')

  req.abort()
  req.flushHeaders()

  // Synchronize on the expected events instead of using a fixed delay.
  const events = []
  const onClose = () => {
    events.push('close')
    maybeAssert()
  }
  const onAbort = () => {
    events.push('abort')
    maybeAssert()
  }

  function cleanup() {
    req.removeListener('close', onClose)
    req.removeListener('abort', onAbort)
  }

  function maybeAssert() {
    if (events.length !== 2) return
    cleanup()

    expect(emitSpy).to.have.been.calledTwice()
    expect(emitSpy.firstCall).to.have.been.calledWith('close')
    expect(emitSpy.secondCall).to.have.been.calledWith('abort')
    expect(scope.isDone()).to.be.false()
    done()
  }

  req.once('close', onClose)
  req.once('abort', onAbort)
})