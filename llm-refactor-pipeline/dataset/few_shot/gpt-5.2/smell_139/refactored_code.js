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

  const streamReady = new Promise((resolve, reject) => {
    passthrough.once('pipe', resolve)
    passthrough.once('error', reject)
  })

  const requestPromise = got('http://example.test/')

  await streamReady
  fs.createReadStream(textFilePath).pipe(passthrough)

  const { body } = await requestPromise

  expect(body).to.equal(textFileContents)
  scope.done()
})