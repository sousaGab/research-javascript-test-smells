it('records and replays correctly with filteringRequestBody', async () => {
    const responseBody = '<html><body>example</body></html>'
    const { origin } = await servers.startHttpServer((request, response) => {
      response.write(responseBody)
      response.end()
    })

    nock.restore()
    nock.recorder.clear()
    expect(nock.recorder.play()).to.be.empty()

    nock.recorder.rec({
      dont_print: true,
      output_objects: true,
    })

    const response1 = await got(origin)
    expect(response1.body).to.equal(responseBody)
    expect(response1.headers).to.be.ok()

    nock.restore()
    const recorded = nock.recorder.play()
    nock.recorder.clear()
    nock.activate()

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
    nocks.forEach(nock => nock.done())
    expect(onFilteringRequestBody).to.have.been.calledOnce()
  })

  function testRecordingAndReplaying(origin) {
    const responseBody = '<html><body>example</body></html>'
    const { origin } = await servers.startHttpServer((request, response) => {
      response.write(responseBody)
      response.end()
    })

    nock.restore()
    nock.recorder.clear()
    expect(nock.recorder.play()).to.be.empty()

    nock.recorder.rec({
      dont_print: true,
      output_objects: true,
    })

    const response1 = await got(origin)
    expect(response1.body).to.equal(responseBody)
    expect(response1.headers).to.be.ok()

    nock.restore()
    const recorded = nock.recorder.play()
    nock.recorder.clear()
    nock.activate()

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
    nocks.forEach(nock => nock.done())
    expect(onFilteringRequestBody).to.have.been.calledOnce()
  }