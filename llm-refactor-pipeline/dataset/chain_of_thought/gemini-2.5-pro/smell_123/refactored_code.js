it('should pass filteringPath options', async () => {
    const server = await startHttpServer()
    const nockBackOptions = {
      before(scope) {
        scope.filteringPath = path =>
          path.replace(/timestamp=[0-9]+/, 'timestamp=1111')
      },
    }

    const assertFixtureHasOneNormalizedRecord = () => {
      const fixtureContent = getFixtureContent()
      expect(fixtureContent).to.have.lengthOf(1)
      expect(fixtureContent[0].path).to.equal('/?timestamp=1111')
    }

    // First call records the fixture with a normalized path.
    const back1 = await nockBack(fixtureFilename, nockBackOptions)
    const response1 = await got(`${server.origin}/?timestamp=1111`)
    back1.nockDone()

    assertFixtureHasOneNormalizedRecord()

    // Second call with a different timestamp should match the recorded fixture.
    const back2 = await nockBack(fixtureFilename, nockBackOptions)
    const response2 = await got(`${server.origin}/?timestamp=2222`)
    back2.nockDone()

    expect(response2.body).to.deep.equal(response1.body)

    // Assert the fixture was not modified by the second call.
    assertFixtureHasOneNormalizedRecord()
  })