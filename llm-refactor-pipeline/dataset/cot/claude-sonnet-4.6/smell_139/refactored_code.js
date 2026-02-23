it('should work with a delayed response stream', async () => {
    const passthrough = new stream.Transform({
      transform(chunk, encoding, callback) {
        this.push(chunk.toString())
        callback()
      },
    })

    const scope = nock('http://example.test')
      .get('/')
      .delayBody(100)
      .reply(200, () => passthrough)

    const pipePromise = new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(textFilePath)
      readStream.on('error', reject)
      passthrough.on('error', reject)
      passthrough.on('finish', resolve)
      readStream.pipe(passthrough)
    })

    const [{ body }] = await Promise.all([
      got('http://example.test/'),
      pipePromise,
    ])

    expect(body).to.equal(textFileContents)
    scope.done()
  })