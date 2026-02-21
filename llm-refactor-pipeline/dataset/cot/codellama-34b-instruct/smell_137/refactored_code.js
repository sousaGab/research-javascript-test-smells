it('calling profile with a callback function should not make a difference', async () => {
  const logger = helpers.createLogger();
  const profile = logger.profile('testing2', {
    something: 'ok',
    level: 'info'
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  expect(profile.info).to.be.an('object');
  expect(profile.info.something).to.equal('ok');
  expect(profile.info.level).to.equal('info');
  expect(profile.info.durationMs).to.be.a('number');
  expect(profile.info.message).to.equal('testing2');
  expect(profile.info[MESSAGE]).to.be.a('string');
});