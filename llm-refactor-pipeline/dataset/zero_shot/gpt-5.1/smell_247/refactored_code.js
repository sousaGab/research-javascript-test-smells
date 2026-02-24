it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')

  const http = require('http')
  const testUrl = 'http://example.com/'

  nockBackWithFixtureLocalhost(err => {
    if (err) return done(err)

    const req = http.get(testUrl, res => {
      try {
        // If net connect is disabled, this request would fail before here.
        expect(res.statusCode).to.be.a('number')
        done()
      } catch (assertErr) {
        done(assertErr)
      }
    })

    req.on('error', requestErr => {
      done(requestErr)
    })
  })
})