it('should pass filteringPath options', async () => {
    const server = await startHttpServer()
    const nockBackOptions = {
      before(scope) {
        scope.filteringPath = path =>
          path.replace(/timestamp=[0-9]+/, 'timestamp=1111')
      },
    }

    // Record the fixture with the first timestamp.
    const back1 = await nockBack(fixtureFilename, nockBackOptions)
    const response1 = await got(`${server.origin}/?timestamp=1111`)
    back1.nockDone()

    // Play back from the fixture using a different timestamp, which should be normalized.
    const back2 = await nockBack(fixtureFilename, nockBackOptions)
    const response2 = await got(`${server.origin}/?timestamp=2222`)
    back2.nockDone()

    // The response from the mocked call should match the original recorded response.
    expect(response2.body).to.deep.equal(response1.body)

    // The fixture should contain only one entry with the normalized path,
    // confirming playback was used and no new fixture was recorded.
    const fixtureContent = getFixtureContent()
    expect(fixtureContent).to.have.lengthOf(1)
    expect(fixtureContent[0].path).to.equal('/?timestamp=1111')
  })