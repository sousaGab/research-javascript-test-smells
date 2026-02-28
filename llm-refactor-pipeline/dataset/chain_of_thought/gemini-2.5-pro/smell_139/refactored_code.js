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
      .reply(200, () => {
        // Start piping the source file on the next tick after the stream has been returned to the client.
        // This ensures the client is ready to receive data.
        process.nextTick(() => {
          fs.createReadStream(textFilePath).pipe(passthrough)
        })
        return passthrough
      })

    const { body } = await got('http://example.test/')

    expect(body).to.equal(textFileContents)
    scope.done()
  })