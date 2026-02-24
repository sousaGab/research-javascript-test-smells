it('should pass filteringPath options', async () => {
  const server = await startHttpServer()
  const nockBackOptions = {
    before(scope) {
      scope.filteringPath = path =>
        path.replace(/timestamp=[0-9]+/, 'timestamp=1111')
    },
  }

  const assertFixtureContent = () => {
    const fixtureContent = getFixtureContent()
    expect(fixtureContent).to.have.lengthOf(1)
    expect(fixtureContent[0].path).to.equal('/?timestamp=1111')
  }

  // Record the fixture with the first timestamp.
  const back1 = await nockBack(fixtureFilename, nockBackOptions)
  const response1 = await got(`${server.origin}/?timestamp=1111`)
  back1.nockDone()

  // Assert the fixture was recorded correctly with the filtered path.
  assertFixtureContent()

  // Replay the fixture with a different timestamp.
  const back2 = await nockBack(fixtureFilename, nockBackOptions)
  const response2 = await got(`${server.origin}/?timestamp=2222`)
  back2.nockDone()

  // Assert that the mocked response was served.
  expect(response2.body).to.deep.equal(response1.body)

  // Assert that the fixture was not modified by the second call.
  assertFixtureContent()
})