it('should pass filteringPath options', async () => {
  const server = await startHttpServer();
  const nockBackOptions = {
    before(scope) {
      scope.filteringPath = path =>
        path.replace(/timestamp=[0-9]+/, 'timestamp=1111');
    },
  };

  // Record the initial request to create the fixture.
  const record = await nockBack(fixtureFilename, nockBackOptions);
  const response1 = await got(`${server.origin}/?timestamp=1111`);
  record.nockDone();

  const fixtureAfterRecord = getFixtureContent();
  expect(fixtureAfterRecord).to.have.lengthOf(1);
  expect(fixtureAfterRecord[0].path).to.equal('/?timestamp=1111');

  // Replay from the fixture with a different request that should match.
  const replay = await nockBack(fixtureFilename, nockBackOptions);
  const response2 = await got(`${server.origin}/?timestamp=2222`);
  replay.nockDone();

  // Assert the replayed response is correct and the fixture is unchanged.
  expect(response2.body).to.deep.equal(response1.body);
  expect(getFixtureContent()).to.deep.equal(fixtureAfterRecord);
});