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

    const streamPromise = new Promise((resolve) => {
      fs.createReadStream(textFilePath).pipe(passthrough);
      passthrough.on('end', resolve);
    });

    const { body } = await got('http://example.test/');
    
    await streamPromise;

    expect(body).to.equal(textFileContents)
    scope.done()
  })