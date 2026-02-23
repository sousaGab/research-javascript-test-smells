it('should pass filteringPath options', async () => {
  const server = await startHttpServer()

  const nockBackOptions = {
    before(scope) {
      scope.filteringPath = path =>
        path.replace(/timestamp=[0-9]+/, 'timestamp=1111')
    },
  }

  const runAndDone = async timestamp => {
    const back = await nockBack(fixtureFilename, nockBackOptions)
    const response = await got(`${server.origin}/?timestamp=${timestamp}`)
    back.nockDone()
    return response
  }

  const expectSingleFixtureWithFilteredPath = () => {
    const fixtureContent = getFixtureContent()
    expect(fixtureContent).to.have.lengthOf(1)
    expect(fixtureContent[0].path).to.equal('/?timestamp=1111')
  }

  const response1 = await runAndDone(1111)
  expectSingleFixtureWithFilteredPath()

  const response2 = await runAndDone(2222)
  expect(response2.body).to.deep.equal(response1.body)
  expectSingleFixtureWithFilteredPath()
})