it('respects http.request() consumers', done => {
  const requestListener = (req, res) => {
    res.write('foo')
    res.end('bar')
  }

  servers.startHttpServer(requestListener).then(({ port }) => {
    nock.restore()
    nock.recorder.clear()
    nock.recorder.rec({
      dont_print: true,
      output_objects: true,
    })

    const req = http.request(
      {
        host: 'localhost',
        port,
        path: '/',
      },
      res => {
        let buffer = Buffer.from('')

        res
          .on('data', data => {
            buffer = Buffer.concat([buffer, data])
          })
          .on('end', () => {
            nock.restore()
            expect(buffer.toString()).to.equal('foobar')
            done()
          })
      },
    )

    req.end()
  })
})