it('Emits the expected event sequence when `flushHeaders` is called on an aborted request', done => {
  const scope = nock('http://example.test').get('/').reply()

  const req = http.request('http://example.test')
  const emitSpy = sinon.spy(req, 'emit')

  req.on('close', () => {
    try {
      expect(emitSpy).to.have.been.calledTwice()
      expect(emitSpy.firstCall).to.have.been.calledWith('close')
      expect(emitSpy.secondCall).to.have.been.calledWith('abort')
      expect(scope.isDone()).to.be.false()
      done()
    } catch (err) {
      done(err)
    }
  })

  req.abort()
  req.flushHeaders()
})