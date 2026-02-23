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

  const readStream = fs.createReadStream(textFilePath)
  const pipingStarted = new Promise((resolve, reject) => {
    readStream.once('error', reject)
    passthrough.once('error', reject)
    readStream.once('readable', () => {
      readStream.pipe(passthrough)
      resolve()
    })
  })

  await pipingStarted

  const { body } = await got('http://example.test/')

  expect(body).to.equal(textFileContents)
  scope.done()
})