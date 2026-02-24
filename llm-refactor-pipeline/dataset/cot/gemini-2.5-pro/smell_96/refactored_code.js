it('when output_objects is true, it records a JSON body as a parsed object', async () => {
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
    expect(recorded[0]).to.deep.include({ body: exampleBody })
  })