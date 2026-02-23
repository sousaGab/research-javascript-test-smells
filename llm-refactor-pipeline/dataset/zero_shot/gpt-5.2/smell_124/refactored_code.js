it('records and replays correctly with filteringRequestBody', async () => {
  const responseBody = '<html><body>example</body></html>'
  const { origin } = await servers.startHttpServer((request, response) => {
    response.write(responseBody)
    response.end()
  })

  const resetRecorder = () => {
    nock.restore()
    nock.recorder.clear()
  }

  const startRecording = () => {
    nock.recorder.rec({
      dont_print: true,
      output_objects: true,
    })
  }

  const stopRecordingAndGetDefinitions = () => {
    nock.restore()
    const recorded = nock.recorder.play()
    nock.recorder.clear()
    nock.activate()
    return recorded
  }

  const assertResponse = async () => {
    const response = await got(origin)
    expect(response.body).to.equal(responseBody)
    expect(response.headers).to.be.ok()
    return response
  }

  resetRecorder()
  expect(nock.recorder.play()).to.be.empty()

  startRecording()
  await assertResponse()

  const recorded = stopRecordingAndGetDefinitions()
  expect(recorded).to.have.lengthOf(1)

  const onFilteringRequestBody = sinon.spy()
  const [definition] = recorded
  definition.filteringRequestBody = (body, aRecodedBody) => {
    onFilteringRequestBody()
    expect(body).to.equal(aRecodedBody)
    return body
  }

  const nocks = nock.define([definition])

  const response2 = await got(origin)
  expect(response2.body).to.equal(responseBody)

  nocks.forEach(n => n.done())
  expect(onFilteringRequestBody).to.have.been.calledOnce()
})