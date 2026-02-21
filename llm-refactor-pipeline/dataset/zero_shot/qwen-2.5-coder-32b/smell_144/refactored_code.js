it('Emits the expected event sequence when `write` is called on an aborted request', done => {
    const scope = nock('http://example.test').get('/').reply()

    const req = http.request('http://example.test')
    const emitSpy = sinon.spy(req, 'emit')
    
    req.abort()
    
    // Use nextTick to ensure the abort event is processed before write
    process.nextTick(() => {
      req.write('foo')
      
      // Use setImmediate to defer the assertion to the next event loop cycle
      setImmediate(() => {
        expect(emitSpy).to.have.been.calledTwice()
        expect(emitSpy.firstCall).to.have.been.calledWith('close')
        expect(emitSpy.secondCall).to.have.been.calledWith('abort')
        expect(scope.isDone()).to.be.false()
        done()
      })
    })
  })