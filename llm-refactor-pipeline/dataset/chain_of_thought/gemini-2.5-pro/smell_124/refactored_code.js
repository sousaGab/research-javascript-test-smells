it('records and replays correctly with filteringRequestBody', async () => {
  // Helper to encapsulate the recording logic.
  const recordHttpInteraction = async origin => {
    nock.restore()
    nock.recorder.clear()

    nock.recorder.rec({
      dont_print: true,
      output_objects: true,
    })

    // Make the live request to record it.
    await got(origin)

    nock.restore()
    const recordedDefinitions = nock.recorder.play()
    nock.recorder.clear()
    nock.activate()

    return recordedDefinitions
  }

  // Arrange: Start a real server and record one interaction.
  const responseBody = '<html><body>example</body></html>'
  const { origin } = await servers.startHttpServer((request, response) => {
    response.write(responseBody)
    response.end()
  })

  const recordedDefs = await recordHttpInteraction(origin)
  expect(recordedDefs).to.have.lengthOf(1)

  // Arrange: Modify the recorded definition to test the filtering function.
  const onFilteringRequestBody = sinon.spy()
  const [definition] = recordedDefs
  definition.filteringRequestBody = (body, aRecodedBody) => {
    onFilteringRequestBody()
    expect(body).to.equal(aRecodedBody)
    return body
  }
  const nocks = nock.define([definition])

  // Act: Make the same request again, which should now be intercepted.
  const response = await got(origin)

  // Assert: Verify the interception and the filtering function call.
  expect(response.body).to.equal(responseBody)
  nocks.forEach(nock => nock.done())
  expect(onFilteringRequestBody).to.have.been.calledOnce()
})