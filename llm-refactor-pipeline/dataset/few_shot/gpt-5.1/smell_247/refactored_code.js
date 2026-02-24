it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')

  const http = require('http')

  const req = http.get('http://example.com', res => {
    expect(res.statusCode).toBeGreaterThanOrEqual(200)
    expect(res.statusCode).toBeLessThan(600)
    res.resume()
    nockBackWithFixtureLocalhost(() => {
      done()
    })
  })

  req.on('error', err => {
    done(err)
  })
})