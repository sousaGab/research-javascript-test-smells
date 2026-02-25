it('records and replays correctly with filteringRequestBody', async () => {
  // Arrange: Start a real server and prepare for recording.
  const responseBody = '<html><body>example</body></html>'
  const { origin } = await servers.startHttpServer((request, response) => {
    response.write(responseBody)
    response.end()
  })

  nock.restore()
  nock.recorder.clear()
  expect(nock.recorder.play()).to.be.empty()

  // Act: Record a real HTTP request.
  nock.recorder.rec({
    dont_print: true,
    output_objects: true,
  })
  const realResponse = await got(origin)
  nock.restore() // Stop recording.

  // Assert: The real request was successful.
  expect(realResponse.body).to.equal(responseBody)
  expect(realResponse.headers).to.be.ok()

  // Arrange: Define a mock from the recording with a spy as the filter.
  const recorded = nock.recorder.play()
  nock.recorder.clear()
  expect(recorded).to.have.lengthOf(1)

  const filteringSpy = sinon.spy((body, recordedBody) => body)
  const [definition] = recorded
  definition.filteringRequestBody = filteringSpy

  const scopes = nock.define([definition])

  // Act: Replay the request to trigger the mock and the filter.
  const mockedResponse = await got(origin)

  // Assert: The mocked response is correct and the filter was called.
  expect(mockedResponse.body).to.equal(responseBody)
  expect(filteringSpy).to.have.been.calledOnce()
  scopes.forEach(scope => scope.done())
})