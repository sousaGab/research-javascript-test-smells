it('prevents the request from completing', done => {
  const onRequest = sinon.spy()

  const req = http.get('http://example.test', onRequest)
  
  req.on('error', () => {
    // Request was aborted, verify it never called the callback
    expect(onRequest).not.to.have.been.called()
    done()
  })

  // Abort the request immediately to prevent it from completing
  setImmediate(() => {
    req.destroy()
    // Verify the abort happened before the delay would complete
    expect(onRequest).not.to.have.been.called()
    done()
  })
})