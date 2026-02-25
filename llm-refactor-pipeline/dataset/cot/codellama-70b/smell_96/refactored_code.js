it('records objects and correctly stores JSON object in body', async () => {
    nock.restore()
    nock.recorder.clear()
    expect(nock.recorder.play()).to.be.empty()

    const { origin } = await servers.startHttpServer()

    nock.recorder.rec({
      dont_print: true,
      output_objects: true,
    })

    const exampleBody = { foo: 123 }

    await got.post(origin, {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(exampleBody),
    })

    nock.restore()
    const recorded = nock.recorder.play()
    nock.recorder.clear()
    nock.activate()

    expect(recorded).to.have.lengthOf(1)

    // TODO See https://github.com/nock/nock/issues/1229

    // This is the current behavior: store body as decoded JSON.
    expect(recorded[0]).to.deep.include({ body: exampleBody })

    // This is the desired behavior: store the body as encoded JSON. The second
    // test shows desired behavior: store body as encoded JSON so that JSON
    // strings can be correctly matched at runtime. Because headers are not
    // stored in the recorder output, it is impossible for the loader to
    // differentiate a stored JSON string from a non-JSON body.
    // expect(recorded[0]).to.include({ body: JSON.stringify(exampleBody) })
  })