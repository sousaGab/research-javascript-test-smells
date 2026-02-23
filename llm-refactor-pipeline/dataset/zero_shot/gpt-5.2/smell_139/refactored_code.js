it('should work with a delayed response stream', async () => {
  const passthrough = new stream.Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString())
      callback()
    },
  })

  const scope = nock('http://example.test')
    .get('/')
    .reply(200, () => passthrough)

  const responsePromise = got('http://example.test/')

  await new Promise((resolve, reject) => {
    const rs = fs.createReadStream(textFilePath)
    rs.on('error', reject)
    passthrough.on('error', reject)
    rs.on('end', resolve)
    rs.pipe(passthrough)
  })

  const { body } = await responsePromise

  expect(body).to.equal(textFileContents)
  scope.done()
})