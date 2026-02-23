// Your COMPLETE refactored test code here
it('Emits the expected event sequence when `flushHeaders` is called on an aborted request', done => {
  const scope = nock('http://example.test').get('/').reply()

  const req = http.request('http://example.test')
  const emitSpy = sinon.spy(req, 'emit')

  let closeEmitted = false
  let abortEmitted = false

  function maybeAssertAndDone() {
    if (!closeEmitted || !abortEmitted) return

    expect(emitSpy).to.have.been.calledTwice()
    expect(emitSpy.firstCall).to.have.been.calledWith('close')
    expect(emitSpy.secondCall).to.have.been.calledWith('abort')
    expect(scope.isDone()).to.be.false()
    done()
  }

  req.once('close', () => {
    closeEmitted = true
    maybeAssertAndDone()
  })

  req.once('abort', () => {
    abortEmitted = true
    maybeAssertAndDone()
  })

  req.abort()
  req.flushHeaders()
})