it('should stop a timer when `done` is called on it', function (done) {
  let timer;
  let logger = helpers.createLogger(function (info) {
    assume(info).is.an('object');
    assume(info.something).equals('ok');
    assume(info.level).equals('info');
    assume(info.durationMs).is.a('number');
    assume(info.message).equals('testing1');
    assume(info[MESSAGE]).is.a('string');
    done();
  });

  timer = logger.startTimer();
  timer.done({
    message: 'testing1',
    something: 'ok',
    level: 'info'
  });
});