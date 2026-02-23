it('calling profile with a callback function should not make a difference', function (done) {
  let logger;

  logger = helpers.createLogger(function (info) {
    try {
      assume(info).is.an('object');
      assume(info.something).equals('ok');
      assume(info.level).equals('info');
      assume(info.durationMs).is.a('number');
      assume(info.message).equals('testing2');
      assume(info[MESSAGE]).is.a('string');
      done();
    } catch (err) {
      done(err);
    }
  });

  logger.profile('testing2', function () {
    done(new Error('Unexpected callback invoked'));
  });

  // Trigger the second profile call on the next tick instead of using a fixed delay.
  process.nextTick(function () {
    logger.profile('testing2', {
      something: 'ok',
      level: 'info'
    });
  });
});