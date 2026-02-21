it('should pass filteringPath options', async () => {
    const server = await startHttpServer()
    const nockBackOptions = {
      before(scope) {
        scope.filteringPath = filterPath
      },
    }

    const back1 = await nockBack(fixtureFilename, nockBackOptions)
    const response1 = await got(`${server.origin}/?timestamp=1111`)
    back1.nockDone()

    const fixtureContent = getFixtureContent()
    expect(fixtureContent).to.have.lengthOf(1)
    expect(fixtureContent[0].path).to.equal('/?timestamp=1111')

    const back2 = await nockBack(fixtureFilename, nockBackOptions)
    const response2 = await got(`${server.origin}/?timestamp=2222`)
    back2.nockDone()

    expect(response2.body).to.deep.equal(response1.body)

    const fixtureContentReloaded = getFixtureContent()
    expect(fixtureContentReloaded).to.have.lengthOf(1)
    expect(fixtureContentReloaded[0].path).to.equal('/?timestamp=1111')
  })

  function filterPath(path) {
    return path.replace(/timestamp=[0-9]+/, 'timestamp=1111')
  }