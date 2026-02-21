const fixtureContent = getFixtureContent()
expect(fixtureContent).to.have.lengthOf(1)
expect(fixtureContent[0].path).to.equal('/?timestamp=1111')