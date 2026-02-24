it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')

  const originalRequest = require('http').request
  const http = require('http')

  // Wrap the callback to assert that a real network request can be made
  nockBackWithFixtureLocalhost(err => {
    expect(err).toBeFalsy()

    const req = http.request(
      { host: 'localhost', port: 80, path: '/', method: 'GET' },
      res => {
        expect(res).toBeDefined()
        expect(typeof res.statusCode).toBe('number')
        // Restore original request in case other tests rely on it
        http.request = originalRequest
        done()
      }
    )

    req.on('error', requestErr => {
      // If net connect is not enabled, this is likely to error
      http.request = originalRequest
      done(requestErr)
    })

    req.end()
  })
})