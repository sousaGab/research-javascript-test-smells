describe('filteringPath options', () => {
  let server;
  let nockBackOptions;
  let firstResponse;

  before(async () => {
    server = await startHttpServer();
    nockBackOptions = {
      before(scope) {
        scope.filteringPath = path =>
          path.replace(/timestamp=[0-9]+/, 'timestamp=1111')
      },
    };
  });

  it('should record fixture with filtered path', async () => {
    const back1 = await nockBack(fixtureFilename, nockBackOptions);
    firstResponse = await got(`${server.origin}/?timestamp=1111`);
    back1.nockDone();

    const fixtureContent = getFixtureContent();
    expect(fixtureContent).to.have.lengthOf(1);
    expect(fixtureContent[0].path).to.equal('/?timestamp=1111');
  });

  it('should use recorded fixture when path matches after filtering', async () => {
    const back2 = await nockBack(fixtureFilename, nockBackOptions);
    const response2 = await got(`${server.origin}/?timestamp=2222`);
    back2.nockDone();

    expect(response2.body).to.deep.equal(firstResponse.body);

    const fixtureContentReloaded = getFixtureContent();
    expect(fixtureContentReloaded).to.have.lengthOf(1);
    expect(fixtureContentReloaded[0].path).to.equal('/?timestamp=1111');
  });
});