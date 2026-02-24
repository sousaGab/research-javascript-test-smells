it('records and replays correctly with filteringRequestBody', async () => {
  // Helper to encapsulate the verbose recording process.
  async function recordHttpInteraction(serverHandler, expectedBody) {
    const { origin } = await servers.startHttpServer(serverHandler)

    // 1. Record a real HTTP request.
    nock.restore()
    nock.recorder.clear()
    nock.recorder.rec({
      dont_print: true,
      output_objects: true,
    })

    const recordResponse = await got(origin)
    expect(recordResponse.body).to.equal(expectedBody)

    // 2. Retrieve the recorded definition.
    nock.restore()
    const recorded = nock.recorder.play()
    nock.recorder.clear()
    nock.activate()

    expect(recorded).to.have.lengthOf(1)
    return { origin, definition: recorded[0] }
  }

  // Arrange
  const responseBody = '<html><body>example</body></html>'
  const serverHandler = (request, response) => {
    response.write(responseBody)
    response.end()
  }

  const { origin, definition } = await recordHttpInteraction(
    serverHandler,
    responseBody
  )

  const onFilteringRequestBody = sinon.spy()
  definition.filteringRequestBody = (body, aRecodedBody) => {
    onFilteringRequestBody()
    expect(body).to.equal(aRecodedBody)
    return body
  }
  const nocks = nock.define([definition])

  // Act
  const replayResponse = await got(origin)

  // Assert
  expect(replayResponse.body).to.equal(responseBody)
  nocks.forEach(nock => nock.done())
  expect(onFilteringRequestBody).to.have.been.calledOnce()
})