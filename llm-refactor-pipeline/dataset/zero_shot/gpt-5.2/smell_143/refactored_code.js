it('Emits the expected event sequence when `flushHeaders` is called on an aborted request', done => {
  const scope = nock('http://example.test').get('/').reply()

  const req = http.request('http://example.test')
  const emitSpy = sinon.spy(req, 'emit')

  req.abort()
  req.flushHeaders()

  const originalEmit = emitSpy.wrappedMethod
  const expectedEvents = ['close', 'abort']
  const observedEvents = []

  emitSpy.restore()
  sinon.stub(req, 'emit').callsFake(function (eventName, ...args) {
    if (expectedEvents.includes(eventName)) observedEvents.push(eventName)
    return originalEmit.call(this, eventName, ...args)
  })

  const maybeAssertAndDone = () => {
    if (observedEvents.length !== expectedEvents.length) return
    try {
      expect(observedEvents).to.deep.equal(expectedEvents)
      expect(scope.isDone()).to.be.false()
      done()
    } catch (err) {
      done(err)
    }
  }

  req.once('close', maybeAssertAndDone)
  req.once('abort', maybeAssertAndDone)
})