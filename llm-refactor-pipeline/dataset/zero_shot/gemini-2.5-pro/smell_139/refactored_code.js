it('should work with a delayed response stream', async () => {
    const scope = nock('http://example.test')
      .get('/')
      .delayBody(100)
      .reply(200, () => {
        const passthrough = new stream.Transform({
          transform(chunk, encoding, callback) {
            this.push(chunk.toString())
            callback()
          },
        })

        fs.createReadStream(textFilePath).pipe(passthrough)
        return passthrough
      })

    const { body } = await got('http://example.test/')

    expect(body).to.equal(textFileContents)
    scope.done()
  })