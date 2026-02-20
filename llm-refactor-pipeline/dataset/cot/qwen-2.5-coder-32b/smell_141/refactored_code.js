it('prevents the request from completing', done => {
  const onRequest = sinon.spy()

  const scope = nock('http://example.test').get('/').delayConnection(100).reply(200, 'OK')

  http.get('http://example.test', onRequest)

  // Use fake timers to avoid actual sleep
  const clock = sinon.useFakeTimers()
  
  // Advance time to trigger the timeout check
  clock.tick(200)
  
  expect(onRequest).not.to.have.been.called()
  done()
  
  // Restore real timers
  clock.restore()
  scope.done()
})