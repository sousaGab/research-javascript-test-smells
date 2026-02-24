it('default levels', function (done) {
  let logger = winston.createLogger();
  let expected = {message: 'foo', level: 'debug'};

  function logLevelTransport(level, shouldBeCalled) {
    return new TransportStream({
      level: level,
      log: function (obj) {
        if (!shouldBeCalled) {
          assume(obj).equals(undefined, 'Transport on level info should never be called');
          return;
        }

        assume(obj.message).equals('foo');
        assume(obj.level).equals('debug');
        assume(JSON.parse(obj[MESSAGE])).deep.equals({level: 'debug', message: 'foo'});
        done();
      }
    });
  }

  assume(logger.info).is.a('function');
  assume(logger.debug).is.a('function');

  logger
    .add(logLevelTransport('info', false))
    .add(logLevelTransport('debug', true))
    .log(expected);
});