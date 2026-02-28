it('calling profile with a callback function should not make a difference', function (done) {
  let profileCompleted = false;
  let callbackInvoked = false;

  let logger = helpers.createLogger(function (info) {
    assume(info).is.an('object');
    assume(info.something).equals('ok');
    assume(info.level).equals('info');
    assume(info.durationMs).is.a('number');
    assume(info.message).equals('testing2');
    assume(info[MESSAGE]).is.a('string');
    
    profileCompleted = true;
    if (!callbackInvoked) {
      done();
    }
  });

  logger.profile('testing2', function () {
    callbackInvoked = true;
    if (profileCompleted) {
      done(new Error('Unexpected callback invoked'));
    }
  });

  logger.profile('testing2', {
    something: 'ok',
    level: 'info'
  });
});