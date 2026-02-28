it('Emits the expected event sequence when `write` is called on an aborted request', done => {
    const scope = nock('http://example.test').get('/').reply()

    const req = http.request('http://example.test')
    const emitSpy = sinon.spy(req, 'emit')
    
    const eventSequence = []
    req.on('close', () => eventSequence.push('close'))
    req.on('abort', () => eventSequence.push('abort'))
    
    req.abort()
    req.write('foo')
    
    process.nextTick(() => {
      expect(emitSpy).to.have.been.calledTwice()
      expect(emitSpy.firstCall).to.have.been.calledWith('close')
      expect(emitSpy.secondCall).to.have.been.calledWith('abort')
      expect(scope.isDone()).to.be.false()
      expect(eventSequence).to.deep.equal(['close', 'abort'])
      done()
    })
  })