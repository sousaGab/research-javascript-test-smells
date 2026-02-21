it('calling profile with a callback function should not make a difference', async () => {
  const logger = helpers.createLogger(function (info) {
    assume(info).is.an('object');
    assume(info.something).equals('ok');
    assume(info.level).equals('info');
    assume(info.durationMs).is.a('number');
    assume(info.message).equals('testing2');
    assume(info[MESSAGE]).is.a('string');
  });

  const profilePromise = logger.profile('testing2', function () {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve();
      }, 100);
    });
  });

  await profilePromise;

  logger.profile('testing2', {
    something: 'ok',
    level: 'info'
  });
});