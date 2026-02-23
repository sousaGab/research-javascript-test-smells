it('records objects and correctly stores JSON object in body', async () => {
  const recordJsonRequest = async (origin, body) => {
    nock.restore()
    nock.recorder.clear()
    expect(nock.recorder.play()).to.be.empty()

    nock.recorder.rec({ dont_print: true, output_objects: true })

    await got.post(origin, {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })

    nock.restore()
    const recorded = nock.recorder.play()
    nock.recorder.clear()
    nock.activate()

    return recorded
  }

  const { origin } = await servers.startHttpServer()
  const exampleBody = { foo: 123 }

  const recorded = await recordJsonRequest(origin, exampleBody)

  expect(recorded).to.have.lengthOf(1)
  expect(recorded[0]).to.deep.include({ body: exampleBody })
})