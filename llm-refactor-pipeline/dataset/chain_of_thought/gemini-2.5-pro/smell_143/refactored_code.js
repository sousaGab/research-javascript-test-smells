it('Emits the expected event sequence when `flushHeaders` is called on an aborted request', done => {
    const scope = nock('http://example.test').get('/').reply()

    const req = http.request('http://example.test')
    const emitSpy = sinon.spy(req, 'emit')

    // The 'abort' event is the last one expected in the sequence.
    // We can synchronize on it to make our assertions.
    req.on('abort', () => {
      expect(emitSpy).to.have.been.calledTwice()
      expect(emitSpy.firstCall).to.have.been.calledWith('close')
      expect(emitSpy.secondCall).to.have.been.calledWith('abort')
      expect(scope.isDone()).to.be.false()
      done()
    })

    req.abort()
    req.flushHeaders()
  })