it('respects http.request() consumers', async () => {
    const requestListener = (req, res) => {
      res.write('foo')
      setTimeout(() => {
        res.end('bar')
      }, 25)
    }

    const { port } = await servers.startHttpServer(requestListener)
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
          })
      },
      50,
    )

    req.end()
  })