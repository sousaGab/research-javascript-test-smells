it('should enable net connect', done => {
  nock.disableNetConnect()
  nockBack.setMode('wild')

  const http = require('http')

  nock.enableNetConnect('127.0.0.1')

  const server = http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('ok')
  })

  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address()
    http
      .get({ hostname: '127.0.0.1', port, path: '/' }, res => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', chunk => {
          body += chunk
        })
        res.on('end', () => {
          server.close(() => {
            try {
              expect(res.statusCode).to.equal(200)
              expect(body).to.equal('ok')
              done()
            } catch (err) {
              done(err)
            }
          })
        })
      })
      .on('error', err => {
        server.close(() => done(err))
      })
  })
})